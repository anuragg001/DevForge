import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";
import { CodeEditorState } from "@/types";

const getInitialState = () => {

    //if we are on server ,return default value
    if (typeof window === "undefined") {
        return {
            language: "javascript",
            fontSize: 14,
            theme: "vs-dark",

        }
    }
    //if we are on the client ,return values from localstorage. bcos localstorage is browser api only 
    const savedLanguage = localStorage.getItem("editor-language") || "javascript";
    const savedtheme = localStorage.getItem("editor-theme") || "vs-dark"
    const savedFontSize = localStorage.getItem("editor-font-size") || 16;
    return {
        language: savedLanguage,
        theme: savedtheme,
        fontSize: Number(savedFontSize)
    }
}


export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const intialState = getInitialState();


    return {
        ...intialState,
        output: "",
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        getCode: () => get().editor?.getValue() || "",

        setEditor: (editor: Monaco) => {
            const savedCode = localStorage.getItem(`editor-code-${get().language}`)
            if (savedCode) editor.setValue(savedCode);
            set({ editor })
        },

        setTheme: (theme: string) => {
            localStorage.setItem("editor-theme", theme)
            set({ theme })
        },

        setFontSize: (fontSize: number) => {
            localStorage.setItem("editor-font-size", fontSize.toString());
            set({ fontSize })
        },

        setLanguage:(language:string)=>{
            //save current code before switching language
            const currentCode = get().editor?.getValue();
            if(currentCode) {
                localStorage.setItem(`editor-code-${get().language}`,currentCode)
            }
            localStorage.setItem("editor-language",language);
            set({language,output:"",error:null})
        },

        runCode: async ()=>{
            const {language,getCode}= get();
            const code = getCode();

            if(!code){
                set({error:"Please write some code "})
                return;
            }
            set({isRunning:true,error:null ,output:""})


            try {
            const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
            const response= await fetch("https://emkc.org/api/v2/piston/runtimes",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({
                    language:runtime.language,
                    version: runtime.version,
                    files :[{content:code}]
                })
            }) 
            const data =await response.json();
            console.log("Data back from piston:",data);

            //handling api level Errors
            if(data.message){
                set({error:data.message,executionResult:{code,output:"",error:data.message}})
                return;
            }

            //handle compile Error
            if(data.compile && data.compile.code !== 0){
                const error = data.compile.stderr || data.compile.output;
                set({
                    error,
                    executionResult:{
                        code,
                        output:"",
                        error
                    },
                })
                return;
            }

            //handle runtime error
            if(data.run || data.run.code !==0){
                const error = data.run.stderr || data.run.output;
                set({
                    error,
                    executionResult:{
                        code,
                        output:"",
                        error,
                    },
                })
                return;
            }

            //if we get here ,execution was successful
            const output = data.run.output;

            set({
                output:output.trim(),
                error:null,
                executionResult:{
                    code,
                    output:output.trim(),
                    error:null,
                }
            })


            } catch (error) {
             console.log("Error running Code:",error);
             set({
                error:"Error running Code",
                executionResult:{
                    code,
                    output:"",
                    error:"Error running code"
                }
             })   
            }finally{
                set({isRunning:false});
            }
        }
    }
})