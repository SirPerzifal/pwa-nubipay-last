import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

interface MachineButtonProps {
  status: string;
  handleClick: (isSelected: boolean) => void;
  className: string;
  disabled: boolean;
}

const MachineButton: React.FC<MachineButtonProps> = React.memo(
  ({ status, handleClick, className, disabled }) => {
    // console.log(
    //   "MachineButton rendered with status:",
    //   status,
    //   handleClick,
    //   className,
    //   disabled
    // );

    const handleChange = () => {
      if (disabled) {
        // playSound(false); // Play negative sound when disabled
        return;
      }
      const isSelected = status !== "dipilih";
      // playSound(isSelected);
      handleClick(isSelected);
    };

    return (
      <label className={`${className}`}>
        <input
          type="checkbox"
          checked={status === "dipilih"}
          onChange={handleChange}
          disabled={disabled}
          style={{ display: "none" }}
        />
        {status === "available" && (
          <img
            src={require("../assets/image/cekabu.webp")}
            alt="available"
            style={{
              width: "70px",
              height: "70px",
              objectFit: "cover",
            }}
          />
        )}
        {status === "dipilih" && (
          <img
            src={require("../assets/image/cekijo.webp")}
            alt="Dipilih"
            style={{
              width: "70px",
              height: "70px",
              objectFit: "cover",
            }}
          />
        )}
        {status === "offline" && (
          <img
            src={require("../assets/image/xmark.webp")}
            alt="Perbaikan"
            style={{
              width: "70px",
              height: "70px",
              objectFit: "cover",
            }}
          />
        )}
        {status === "in_use" && (
          <FontAwesomeIcon
            icon={faRotate}
            size="2x"
            spin
            className="rotate-icon"
            style={{ animationDuration: "4.5s" }}
          />
        )}
      </label>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    // Return true if props are equal (prevent re-render)
    // Return false if props are different (allow re-render)
    return (
      prevProps.status === nextProps.status &&
      prevProps.className === nextProps.className &&
      prevProps.disabled === nextProps.disabled
      // Note: handleClick is excluded because it's a function reference
      // that might change on every render from parent
    );
  }
);

MachineButton.displayName = "MachineButton";

export default MachineButton;
