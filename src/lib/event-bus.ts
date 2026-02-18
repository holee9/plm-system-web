/**
 * In-Process Event Bus
 *
 * A type-safe publish/subscribe event bus for module communication.
 * Supports standard listeners, one-time listeners, wildcard subscriptions,
 * and error isolation between listeners.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Event name type - extends string to enable strict typing
 */
export type EventName = string;

/**
 * Event payload type - can be any JSON-serializable value
 */
export type EventPayload = unknown;

/**
 * Event listener function type
 */
export type EventListener<TPayload extends EventPayload = EventPayload> = (
  payload: TPayload,
  eventName?: EventName
) => void | Promise<void>;

/**
 * Unsubscribe function type returned by subscribe and once
 */
export type UnsubscribeFn = () => void;

/**
 * Listener entry stored internally
 */
interface ListenerEntry<TPayload extends EventPayload> {
  listener: EventListener<TPayload>;
  once: boolean;
}

/**
 * Event bus interface
 */
export interface EventBus {
  /**
   * Subscribe to an event
   * @param eventName - The event name to listen for
   * @param listener - The callback function to execute when event is published
   * @returns Unsubscribe function
   */
  subscribe<TPayload extends EventPayload>(
    eventName: EventName,
    listener: EventListener<TPayload>
  ): UnsubscribeFn;

  /**
   * Subscribe to an event that will only be called once
   * @param eventName - The event name to listen for
   * @param listener - The callback function to execute once when event is published
   * @returns Unsubscribe function
   */
  once<TPayload extends EventPayload>(
    eventName: EventName,
    listener: EventListener<TPayload>
  ): UnsubscribeFn;

  /**
   * Publish an event to all subscribers
   * @param eventName - The event name to publish
   * @param payload - The event payload data
   */
  publish<TPayload extends EventPayload>(
    eventName: EventName,
    payload?: TPayload
  ): void;

  /**
   * Remove all listeners for a specific event or all events
   * @param eventName - Optional event name, if not provided clears all listeners
   */
  clear(eventName?: EventName): void;

  /**
   * Get the number of listeners for an event
   * @param eventName - The event name to count listeners for
   * @returns The number of listeners
   */
  listenerCount(eventName: EventName): number;
}

// ============================================================================
// Event Bus Implementation
// ============================================================================

/**
 * Creates a new event bus instance
 * @returns A new event bus
 */
export function createEventBus(): EventBus {
  // Map of event name to list of listeners
  const listeners = new Map<EventName, ListenerEntry<EventPayload>[]>();

  /**
   * Subscribe to an event
   */
  function subscribe<TPayload extends EventPayload>(
    eventName: EventName,
    listener: EventListener<TPayload>,
    once: boolean = false
  ): UnsubscribeFn {
    // Initialize listener array if not exists
    if (!listeners.has(eventName)) {
      listeners.set(eventName, []);
    }

    // Add listener to the event
    const entry: ListenerEntry<TPayload> = { listener, once };
    listeners.get(eventName)!.push(entry as ListenerEntry<EventPayload>);

    // Return unsubscribe function
    return () => {
      const eventListeners = listeners.get(eventName);
      if (eventListeners) {
        const index = eventListeners.findIndex(
          (e) => e.listener === listener
        );
        if (index !== -1) {
          eventListeners.splice(index, 1);
        }

        // Clean up empty arrays
        if (eventListeners.length === 0) {
          listeners.delete(eventName);
        }
      }
    };
  }

  /**
   * Subscribe to an event that will only be called once
   */
  function onceWrapper<TPayload extends EventPayload>(
    eventName: EventName,
    listener: EventListener<TPayload>
  ): UnsubscribeFn {
    return subscribe(eventName, listener, true);
  }

  /**
   * Publish an event to all subscribers
   */
  function publish<TPayload extends EventPayload>(
    eventName: EventName,
    payload?: TPayload
  ): void {
    // Get specific event listeners
    const eventListeners = listeners.get(eventName) || [];

    // Get wildcard listeners
    const wildcardListeners = listeners.get("*") || [];

    // Combine listeners (specific first, then wildcard)
    const allListeners = [...eventListeners, ...wildcardListeners];

    // Collect listeners to remove after execution
    const toRemove: Array<{
      eventName: EventName;
      listener: EventListener;
    }> = [];

    // Execute listeners with error isolation
    for (const entry of allListeners) {
      try {
        // Call the listener
        // Wildcard listeners receive both payload and event name
        if (eventName === "*") {
          entry.listener(payload, eventName);
        } else {
          const isWildcard = listeners.get("*")?.includes(entry);
          if (isWildcard) {
            entry.listener(payload, eventName);
          } else {
            entry.listener(payload);
          }
        }

        // Mark one-time listeners for removal
        if (entry.once) {
          // Check if this is a wildcard listener or specific listener
          const specificListeners = listeners.get(eventName);
          if (specificListeners?.includes(entry)) {
            toRemove.push({ eventName, listener: entry.listener });
          } else {
            toRemove.push({ eventName: "*", listener: entry.listener });
          }
        }
      } catch (error) {
        // Log error but continue with other listeners
        console.error(
          `Error in event listener for "${eventName}":`,
          error
        );
      }
    }

    // Remove one-time listeners
    for (const { eventName: eventToRemove, listener: listenerToRemove } of toRemove) {
      const eventListeners = listeners.get(eventToRemove);
      if (eventListeners) {
        const index = eventListeners.findIndex(
          (e) => e.listener === listenerToRemove
        );
        if (index !== -1) {
          eventListeners.splice(index, 1);
        }

        // Clean up empty arrays
        if (eventListeners.length === 0) {
          listeners.delete(eventToRemove);
        }
      }
    }
  }

  /**
   * Remove all listeners for a specific event or all events
   */
  function clear(eventName?: EventName): void {
    if (eventName) {
      listeners.delete(eventName);
    } else {
      listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   */
  function listenerCount(eventName: EventName): number {
    const eventListeners = listeners.get(eventName);
    return eventListeners ? eventListeners.length : 0;
  }

  return {
    subscribe,
    once: onceWrapper,
    publish,
    clear,
    listenerCount,
  };
}

// ============================================================================
// Global Event Bus Instance
// ============================================================================

/**
 * Global event bus instance for application-wide event communication
 * Can be used directly or as a fallback when module-specific buses aren't needed
 */
export const globalEventBus = createEventBus();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a namespaced event bus
 * @param namespace - The namespace prefix for all events
 * @returns An event bus that prefixes all event names with the namespace
 */
export function createNamespacedEventBus(
  namespace: string
): EventBus {
  const baseBus = createEventBus();
  const separator = ":";

  return {
    subscribe<TPayload extends EventPayload>(
      eventName: EventName,
      listener: EventListener<TPayload>
    ): UnsubscribeFn {
      const fullEventName = `${namespace}${separator}${eventName}`;
      return baseBus.subscribe(fullEventName, listener);
    },

    once<TPayload extends EventPayload>(
      eventName: EventName,
      listener: EventListener<TPayload>
    ): UnsubscribeFn {
      const fullEventName = `${namespace}${separator}${eventName}`;
      return baseBus.once(fullEventName, listener);
    },

    publish<TPayload extends EventPayload>(
      eventName: EventName,
      payload?: TPayload
    ): void {
      const fullEventName = `${namespace}${separator}${eventName}`;
      baseBus.publish(fullEventName, payload);
    },

    clear(eventName?: EventName): void {
      if (eventName) {
        const fullEventName = `${namespace}${separator}${eventName}`;
        baseBus.clear(fullEventName);
      } else {
        baseBus.clear();
      }
    },

    listenerCount(eventName: EventName): number {
      const fullEventName = `${namespace}${separator}${eventName}`;
      return baseBus.listenerCount(fullEventName);
    },
  };
}
