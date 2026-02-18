// Tests for in-process event bus with publish/subscribe pattern
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createEventBus,
  type EventBus,
  type EventListener,
  type UnsubscribeFn,
} from "../event-bus";

describe("EventBus", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = createEventBus();
  });

  describe("subscribe and publish", () => {
    it("should call subscribed listener when event is published", () => {
      const listener = vi.fn();
      eventBus.subscribe("test.event", listener);

      eventBus.publish("test.event", { data: "test" });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ data: "test" });
    });

    it("should call multiple listeners for the same event", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      eventBus.subscribe("test.event", listener1);
      eventBus.subscribe("test.event", listener2);

      eventBus.publish("test.event", { value: 42 });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledWith({ value: 42 });
      expect(listener2).toHaveBeenCalledWith({ value: 42 });
    });

    it("should not call listeners for different events", () => {
      const listener = vi.fn();
      eventBus.subscribe("test.event", listener);

      eventBus.publish("other.event", { data: "test" });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should call listener with correct payload", () => {
      const listener = vi.fn();
      eventBus.subscribe("user.created", listener);

      const payload = { id: "123", name: "John Doe" };
      eventBus.publish("user.created", payload);

      expect(listener).toHaveBeenCalledWith(payload);
    });

    it("should handle events with no listeners gracefully", () => {
      expect(() => {
        eventBus.publish("nonexistent.event", { data: "test" });
      }).not.toThrow();
    });
  });

  describe("unsubscribe", () => {
    it("should stop calling listener after unsubscribe", () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe("test.event", listener);

      eventBus.publish("test.event", { data: "first" });
      unsubscribe();
      eventBus.publish("test.event", { data: "second" });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ data: "first" });
    });

    it("should only unsubscribe the specific listener", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsubscribe1 = eventBus.subscribe("test.event", listener1);
      eventBus.subscribe("test.event", listener2);

      unsubscribe1();
      eventBus.publish("test.event", { data: "test" });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should return a function that can be called multiple times safely", () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe("test.event", listener);

      unsubscribe();
      expect(() => unsubscribe()).not.toThrow();

      eventBus.publish("test.event", { data: "test" });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("once", () => {
    it("should call listener only once even if event is published multiple times", () => {
      const listener = vi.fn();
      eventBus.once("test.event", listener);

      eventBus.publish("test.event", { data: "first" });
      eventBus.publish("test.event", { data: "second" });
      eventBus.publish("test.event", { data: "third" });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ data: "first" });
    });

    it("should unsubscribe itself after first call", () => {
      const listener = vi.fn();
      eventBus.once("test.event", listener);

      eventBus.publish("test.event", { data: "first" });
      eventBus.publish("test.event", { data: "second" });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should return unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.once("test.event", listener);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
      eventBus.publish("test.event", { data: "test" });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("should remove all listeners for a specific event", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      eventBus.subscribe("test.event", listener1);
      eventBus.subscribe("test.event", listener2);
      eventBus.subscribe("other.event", vi.fn());

      eventBus.clear("test.event");

      eventBus.publish("test.event", { data: "test" });
      eventBus.publish("other.event", { data: "test" });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it("should remove all listeners when no event name is provided", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      eventBus.subscribe("test.event", listener1);
      eventBus.subscribe("other.event", listener2);

      eventBus.clear();

      eventBus.publish("test.event", { data: "test" });
      eventBus.publish("other.event", { data: "test" });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe("listenerCount", () => {
    it("should return the number of listeners for an event", () => {
      expect(eventBus.listenerCount("test.event")).toBe(0);

      eventBus.subscribe("test.event", vi.fn());
      expect(eventBus.listenerCount("test.event")).toBe(1);

      eventBus.subscribe("test.event", vi.fn());
      eventBus.subscribe("test.event", vi.fn());
      expect(eventBus.listenerCount("test.event")).toBe(3);
    });

    it("should return 0 for events with no listeners", () => {
      expect(eventBus.listenerCount("nonexistent.event")).toBe(0);
    });

    it("should decrease count when listener is unsubscribed", () => {
      const unsubscribe = eventBus.subscribe("test.event", vi.fn());
      expect(eventBus.listenerCount("test.event")).toBe(1);

      unsubscribe();
      expect(eventBus.listenerCount("test.event")).toBe(0);
    });
  });

  describe("event names", () => {
    it("should handle event names with dots", () => {
      const listener = vi.fn();
      eventBus.subscribe("module.submodule.action", listener);

      eventBus.publish("module.submodule.action", { data: "test" });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should distinguish between similar event names", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      eventBus.subscribe("test.event", listener1);
      eventBus.subscribe("test.event.suffix", listener2);

      eventBus.publish("test.event", { data: "test1" });
      eventBus.publish("test.event.suffix", { data: "test2" });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledWith({ data: "test1" });
      expect(listener2).toHaveBeenCalledWith({ data: "test2" });
    });
  });

  describe("error handling", () => {
    it("should continue calling other listeners if one throws", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Test error");
      });
      const normalListener = vi.fn();
      eventBus.subscribe("test.event", errorListener);
      eventBus.subscribe("test.event", normalListener);

      expect(() => {
        eventBus.publish("test.event", { data: "test" });
      }).not.toThrow();

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });

    it("should handle undefined and null payloads", () => {
      const listener = vi.fn();
      eventBus.subscribe("test.event", listener);

      eventBus.publish("test.event", undefined);
      eventBus.publish("test.event", null);

      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe("wildcard events", () => {
    it("should support wildcard (*) listener for all events", () => {
      const wildcardListener = vi.fn();
      eventBus.subscribe("*", wildcardListener);

      eventBus.publish("event1", { data: "test1" });
      eventBus.publish("event2", { data: "test2" });

      expect(wildcardListener).toHaveBeenCalledTimes(2);
    });

    it("should include event name in wildcard listener", () => {
      const wildcardListener = vi.fn();
      eventBus.subscribe("*", wildcardListener);

      eventBus.publish("test.event", { data: "test" });

      expect(wildcardListener).toHaveBeenCalledWith(
        { data: "test" },
        "test.event"
      );
    });

    it("should call specific event listeners before wildcard", () => {
      const callOrder: string[] = [];
      const specificListener = vi.fn(() => {
        callOrder.push("specific");
      });
      const wildcardListener = vi.fn(() => {
        callOrder.push("wildcard");
      });

      eventBus.subscribe("test.event", specificListener);
      eventBus.subscribe("*", wildcardListener);

      eventBus.publish("test.event", { data: "test" });

      expect(callOrder).toEqual(["specific", "wildcard"]);
    });
  });
});
