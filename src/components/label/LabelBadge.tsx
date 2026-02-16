import { Badge } from "@/components/ui/badge";

interface LabelBadgeProps {
  name: string;
  color?: string;
}

export function LabelBadge({ name, color = "#6b7280" }: LabelBadgeProps) {
  // Determine text color based on background for better contrast
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000" : "#fff";
  };

  const textColor = getContrastColor(color);

  return (
    <Badge
      variant="default"
      className="font-normal"
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      {name}
    </Badge>
  );
}
