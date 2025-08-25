"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
  undefined
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const formContext = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }

  const formState = useFormState({ name: fieldContext.name })
  const fieldState = formContext.getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formControlId: `${id}-form-control`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | undefined>(
  undefined
)

const FormItem = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, id: idProp, ...props }, ref) => {
    const reactId = React.useId()
    const id = idProp ?? reactId

    return (
      <FormItemContext.Provider value={{ id }}>
        <div
          ref={ref}
          {...props}
          id={id}
          data-slot="form-item"
          className={cn("grid gap-2", className)}
        />
      </FormItemContext.Provider>
    )
  }
)

FormItem.displayName = "FormItem"

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formControlId } = useFormField()

  return (
    <Label
      {...props}
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formControlId}
    />
  )
}

FormLabel.displayName = "FormLabel"

function FormControl(props: React.ComponentProps<typeof Slot>) {
  const { error, formControlId, formDescriptionId, formMessageId } =
    useFormField()
  const consumerDescribedBy = props["aria-describedby"] as string | undefined
  const ownDescribedBy = !error
    ? formDescriptionId
    : `${formDescriptionId} ${formMessageId}`
  const describedBy = [ownDescribedBy, consumerDescribedBy]
    .filter(Boolean)
    .join(" ")

  return (
    <Slot
      data-slot="form-control"
      {...props}
      id={formControlId}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      aria-errormessage={error ? formMessageId : undefined}
    />
  )
}

FormControl.displayName = "FormControl"

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      {...props}
      id={formDescriptionId}
      className={cn("text-muted-foreground copy-14", className)}
    />
  )
}

FormDescription.displayName = "FormDescription"

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      {...props}
      id={formMessageId}
      className={cn("text-destructive copy-14", className)}
      role={error ? "alert" : undefined}
    >
      {body}
    </p>
  )
}

FormMessage.displayName = "FormMessage"

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
