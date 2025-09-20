"use client"

import * as React from "react"
import { XIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
  disable?: boolean
  /** fixed option that can't be removed. */
  fixed?: boolean
}

interface MultipleSelectorProps {
  value?: Option[]
  options?: Option[]
  placeholder?: string
  onChange?: (options: Option[]) => void
  /** Limit the maximum number of selected options. */
  maxSelected?: number
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean
  disabled?: boolean
  className?: string
  badgeClassName?: string
}

const MultipleSelector = ({
  value = [],
  onChange,
  placeholder = "Select options...",
  options = [],
  maxSelected = Number.MAX_SAFE_INTEGER,
  hidePlaceholderWhenSelected,
  disabled,
  className,
  badgeClassName,
}: MultipleSelectorProps) => {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Option[]>(value)

  React.useEffect(() => {
    if (value) {
      setSelected(value)
    }
  }, [value])

  const handleUnselect = React.useCallback(
    (option: Option) => {
      const newOptions = selected.filter((s) => s.value !== option.value)
      setSelected(newOptions)
      onChange?.(newOptions)
    },
    [onChange, selected]
  )

  const handleSelect = React.useCallback(
    (option: Option) => {
      if (selected.length >= maxSelected) {
        return
      }
      if (!selected.find((s) => s.value === option.value)) {
        const newOptions = [...selected, option]
        setSelected(newOptions)
        onChange?.(newOptions)
      }
    },
    [onChange, selected, maxSelected]
  )

  const availableOptions = options.filter(
    (option) => !selected.find((s) => s.value === option.value)
  )

  return (
    <div className="relative">
      <div
        className={cn(
          "border-input focus-within:border-ring focus-within:ring-ring/50 relative min-h-[38px] rounded-md border text-sm transition-[color,box-shadow] outline-none focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
          {
            "p-1": selected.length !== 0,
            "cursor-text": !disabled && selected.length !== 0,
          },
          className
        )}
        onClick={() => {
          if (disabled) return
          setOpen(!open)
        }}
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => {
            return (
              <div
                key={option.value}
                className={cn(
                  "animate-fadeIn bg-background text-secondary-foreground hover:bg-background relative inline-flex h-7 cursor-default items-center rounded-md border ps-2 pe-7 pl-2 text-xs font-medium transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-fixed:pe-2",
                  badgeClassName
                )}
                data-fixed={option.fixed}
                data-disabled={disabled || undefined}
              >
                {option.label}
                <button
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute -inset-y-px -end-px flex size-7 items-center justify-center rounded-e-md border border-transparent p-0 outline-hidden transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(option)}
                  aria-label="Remove"
                >
                  <XIcon size={14} aria-hidden="true" />
                </button>
              </div>
            )
          })}
          
          <div className="flex-1 flex items-center">
            <span
              className={cn(
                "placeholder:text-muted-foreground/70 flex-1 bg-transparent outline-hidden disabled:cursor-not-allowed",
                {
                  "w-full": hidePlaceholderWhenSelected,
                  "px-3 py-2": selected.length === 0,
                  "ml-1": selected.length !== 0,
                }
              )}
            >
              {hidePlaceholderWhenSelected && selected.length !== 0
                ? ""
                : placeholder}
            </span>
            <ChevronDownIcon 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        </div>
      </div>
      
      {open && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg">
          {availableOptions.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            availableOptions.map((option) => (
              <div
                key={option.value}
                className="cursor-pointer px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  handleSelect(option)
                  setOpen(false)
                }}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

MultipleSelector.displayName = "MultipleSelector"
export default MultipleSelector