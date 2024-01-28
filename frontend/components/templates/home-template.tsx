"use client";

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import React, { useState } from "react";
import { GlobalContext } from "@/app/global-context";
import { useRelationEvent } from "@/hooks/use-relation-event";

export default function HomeTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSearchPopupOpen, openSearchPopup] = useState(false);
  const [isShortcutHelpPopupOpen, openShortcutHelpPopup] = useState(false);
  const [isFloatingShortcutHelperOpen, showFloatingShortcut] = useState(true);

  const globalContext: GlobalContext = {
    searchPopup: {
      state: isSearchPopupOpen,
      set: openSearchPopup,
    },
    shortcutHelpPopup: {
      state: isShortcutHelpPopupOpen,
      set: openShortcutHelpPopup,
    },
    floatingShortcut: {
      state: isFloatingShortcutHelperOpen,
      set: showFloatingShortcut,
    },
  };

  useKeyboardShortcut({
    keys: ["ctrl", "alt", "p"],
    callback() {
      openSearchPopup(true);
    },
  });

  useKeyboardShortcut({
    keys: ["Escape"],
    callback() {
      if (isSearchPopupOpen) openSearchPopup(false);
      if (isShortcutHelpPopupOpen) openShortcutHelpPopup(false);
    },
  });

  useKeyboardShortcut({
    keys: ["shift", "?"],
    callback() {
      openShortcutHelpPopup(true);
    },
  });

  useRelationEvent();

  return (
    <GlobalContext.Provider value={globalContext}>
      {children}
    </GlobalContext.Provider>
  );
}
