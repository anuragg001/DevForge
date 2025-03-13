"use client"

import { useCodeEditorStore } from "@/store/useCodeEditorStore"
import { useState } from "react"

function ShareSnippetDialog({ onClose }: { onClose: () => void }) {
    const [isSharing,setIsSharing] = useState(false)
    const [title,setTitle]=  useState("")
    const { language,getCode,}=useCodeEditorStore()


    return (
        <div>ShareSnippetDialog</div>
    )
}

export default ShareSnippetDialog