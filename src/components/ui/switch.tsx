import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    style?: React.CSSProperties & { '--primary'?: string }
  }
>(({ className, style, checked, ...props }, ref) => {
  const primaryColor = style?.['--primary'] || '#16a34a';
  const switchRef = React.useRef<HTMLButtonElement>(null);
  
  React.useImperativeHandle(ref, () => switchRef.current as any);
  
  // Observar mudanças no data-state e aplicar cor verde quando checked
  React.useEffect(() => {
    const element = switchRef.current;
    if (!element) return;
    
    const updateColor = () => {
      const isChecked = element.getAttribute('data-state') === 'checked';
      if (isChecked) {
        element.style.backgroundColor = primaryColor;
      } else {
        element.style.backgroundColor = '';
      }
    };
    
    // Aplicar cor inicial
    updateColor();
    
    // Observar mudanças no atributo data-state
    const observer = new MutationObserver(updateColor);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-state']
    });
    
    return () => observer.disconnect();
  }, [primaryColor]);
  
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-slate-200",
        className
      )}
      style={style}
      checked={checked}
      {...props}
      ref={(node) => {
        switchRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
