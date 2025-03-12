"use client"

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useUser } from "@clerk/nextjs"

function RunButton() {
  const {user} = useUser();
  const {runCode,isRunning,language,}= useCodeEditorStore();
  return (
    <div>RunButton</div>
  )
}

export default RunButton