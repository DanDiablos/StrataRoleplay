import React, { useState, useEffect } from "react";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { fetchNui } from "../utils/fetchNui";
import { TargetOption, TargetData } from "../types/target";
import { isEnvBrowser } from "../utils/misc";
import { debugData } from "../utils/debugData";

const IDLE_ICON = "fa-solid fa-crosshairs";

const App: React.FC = () => {
  const [targetData, setTargetData] = useState<TargetData>({});
  const [eyeHover, setEyeHover] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(IDLE_ICON);
  const [isIconChanging, setIsIconChanging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // debug data (set this to test while in web)
  useEffect(() => {
    if (isEnvBrowser()) {
      debugData([
        {
          action: "setTarget",
          data: {
            targetIcon: "car",
            options: {
              global: [
                { icon: "fa-solid fa-key", label: "Give Keys", hide: false },
                { icon: "fa-solid fa-lock", label: "Toggle Locks", hide: false },
                { icon: "fa-solid fa-box", label: "Search", hide: false },
              ],
            },
          },
        },
      ]);
    }
  }, []);

  const transitionIcon = (next: string) => {
    setIsIconChanging(true);
    setTimeout(() => {
      setCurrentIcon(next);
      setIsIconChanging(false);
    }, 150);
  };

  useNuiEvent("leftTarget", () => {
    setTargetData({});
    setEyeHover(false);
    transitionIcon(IDLE_ICON);
  });

  useNuiEvent<TargetData>("setTarget", (data) => {
    setTargetData(data);
    setEyeHover(true);
  });

  useNuiEvent<boolean>("visible", (visible) => {
    setIsVisible(visible);

    if (!visible) {
      setTargetData({});
      setEyeHover(false);
      transitionIcon(IDLE_ICON);
    }
  });

  const handleOptionClick = async (
    targetType: string,
    targetId: number,
    zoneId?: number
  ) => {
    try {
      await fetchNui("select", [targetType, targetId, zoneId], {
        success: true,
      });
    } catch (error) {
      console.error("Error in option clicked", error);
    }
  };

  const createOptions = (
    type: string,
    data: TargetOption[],
    zoneId?: number
  ) => {
    return data
      .map((option, id) => {
        if (option.hide) return null;

        return (
          <li
            key={`${type}-${id}`}
            className="flex items-center gap-2 py-1 text-white/80 font-medium hover:text-[#FF5C3A] cursor-pointer transition-all duration-150 hover:translate-x-0.5"
            onClick={() => handleOptionClick(type, id + 1, zoneId)}
          >
            {option.icon && (
              <i
                className={`fa-fw ${option.icon} text-[#FF5C3A] text-sm shrink-0`}
              />
            )}
            <span>{option.label}</span>
          </li>
        );
      })
      .filter(Boolean);
  };

  const getCursorSize = () => {
    return eyeHover ? "text-lg" : "text-sm";
  };

  if (!isVisible) return null;

  const hasOptions =
    (targetData.options &&
      Object.values(targetData.options).some((opts) =>
        (opts as TargetOption[]).some((o) => !o.hide)
      )) ||
    (targetData.zones &&
      targetData.zones.some((zoneOpts) => zoneOpts.some((o) => !o.hide)));

  return (
    <div className="w-full absolute bottom-1/2 text-center transform translate-y-1/2">
      {/* Crosshair cursor */}
      <div className="flex justify-center items-center">
        <i
          className={`${currentIcon} ${getCursorSize()} transition-all duration-200 ${
            eyeHover ? "text-[#FF5C3A]" : "text-white/40"
          } ${isIconChanging ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
        />
      </div>

      {/* Options list */}
      {hasOptions && (
        <div
          className="absolute left-1/2 top-7 w-fit max-w-[280px] text-left"
          style={{ transform: "translateX(-50%)" }}
        >
          <div
            className="rounded-none px-4 py-2.5"
            style={{
              background: "rgba(10,10,10,0.92)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderLeft: "3px solid #FF5C3A",
            }}
          >
            <ul className="list-none m-0 p-0 text-sm">
              {Object.entries(targetData.options!).map(([type, options]) =>
                createOptions(type, options as TargetOption[])
              )}
              {targetData.zones?.map(
                (zoneOptions: TargetOption[], zoneIndex: number) =>
                  createOptions("zones", zoneOptions, zoneIndex + 1)
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
