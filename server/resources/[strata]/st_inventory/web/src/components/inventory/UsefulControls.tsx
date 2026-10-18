import React, { useState, useEffect } from 'react';
import { fetchNui } from '../../utils/fetchNui';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
  infoVisible: boolean;
  setInfoVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const UsefulControls: React.FC<Props> = ({ infoVisible, setInfoVisible }) => {
  const [screenBlurEnabled, setScreenBlurEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await fetchNui<{ screenBlur: boolean; audio: boolean }>('getSettings');
        setScreenBlurEnabled(settings.screenBlur);
        setAudioEnabled(settings.audio);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const { refs, context } = useFloating({
    open: infoVisible,
    onOpenChange: setInfoVisible,
  });

  const dismiss = useDismiss(context, {
    outsidePressEvent: 'mousedown',
  });

  const { isMounted, styles } = useTransitionStyles(context);

  const { getFloatingProps } = useInteractions([dismiss]);

  const handleScreenBlurToggle = async (enabled: boolean) => {
    setScreenBlurEnabled(enabled);
    try {
      await fetchNui('toggleScreenBlur', enabled);
    } catch (error) {
      console.error('Failed to toggle screen blur:', error);
      setScreenBlurEnabled(!enabled);
    }
  };

  const handleAudioToggle = async (enabled: boolean) => {
    setAudioEnabled(enabled);
    try {
      await fetchNui('toggleAudio', enabled);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      setAudioEnabled(!enabled);
    }
  };

  return (
    <>
      {isMounted && (
        <FloatingPortal>
          <FloatingOverlay lockScroll className="useful-controls-dialog-overlay" data-open={infoVisible} style={styles}>
            <FloatingFocusManager context={context}>
              <div ref={refs.setFloating} {...getFloatingProps()} className="useful-controls-dialog" style={styles}>
                <div className="useful-controls-dialog-title">
                  <p>Inventory Settings</p>
                  <div className="useful-controls-dialog-close" onClick={() => setInfoVisible(false)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </div>
                </div>
                <div className="useful-controls-content-wrapper">
                  <div className="settings-section">
                    <h3>Controls</h3>
                    <p>
                      <kbd>RMB</kbd> - Open Context Menu
                    </p>
                    <p>
                      <kbd>ALT + LMB / MMB</kbd> - Quick use item
                    </p>
                    <p>
                      <kbd>SHIFT + LMB</kbd> - Quick move item
                    </p>
                    <p>
                      <kbd>SHIFT + Drag</kbd> - Move all items
                    </p>
                  </div>

                  <div className="settings-section">
                    <h3>Display Settings</h3>
                    <div className="setting-item">
                      <label>Screen Blur</label>
                      <input
                        type="checkbox"
                        checked={screenBlurEnabled}
                        onChange={(e) => handleScreenBlurToggle(e.target.checked)}
                      />
                    </div>
                    <div className="setting-item">
                      <label>Drop Sound</label>
                      <input
                        type="checkbox"
                        checked={audioEnabled}
                        onChange={(e) => handleAudioToggle(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </>
  );
};

export default UsefulControls;
