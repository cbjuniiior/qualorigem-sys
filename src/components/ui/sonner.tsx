import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { CheckCircle, Info, WarningCircle, XCircle } from "@phosphor-icons/react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      richColors
      closeButton
      icons={{
        success: <CheckCircle size={22} weight="fill" className="text-emerald-500" />,
        info: <Info size={22} weight="fill" className="text-blue-500" />,
        warning: <WarningCircle size={22} weight="fill" className="text-amber-500" />,
        error: <XCircle size={22} weight="fill" className="text-rose-500" />,
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-800 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-[0_20px_50px_rgba(0,0,0,0.12)] group-[.toaster]:rounded-[1.25rem] group-[.toaster]:p-4 group-[.toaster]:font-bold group-[.toaster]:border",
          description: "group-[.toast]:text-slate-500 group-[.toast]:font-medium group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:font-black",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:font-black",
          closeButton: 
            "group-[.toast]:bg-white group-[.toast]:border-slate-100 group-[.toast]:text-slate-400 hover:group-[.toast]:bg-slate-50 hover:group-[.toast]:text-slate-600 transition-all",
          success: "group-[.toaster]:border-emerald-200 group-[.toaster]:bg-emerald-50/60 group-[.toaster]:text-emerald-900",
          error: "group-[.toaster]:border-rose-200 group-[.toaster]:bg-rose-50/60 group-[.toaster]:text-rose-900",
          warning: "group-[.toaster]:border-amber-200 group-[.toaster]:bg-amber-50/60 group-[.toaster]:text-amber-900",
          info: "group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50/60 group-[.toaster]:text-blue-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
