"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { routes } from "@/constants/routes"
import { requestOtp, signInWithGithub } from "@/features/auth/actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconBrandGithub, IconStackBackward } from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const emailFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
})

const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  })

  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      otp: "",
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isOTP, setIsOTP] = useState(false)
  const router = useRouter()
  // Get form state for validation
  const { isValid } = otpForm.formState

  const handleEmailSubmit = async (data: z.infer<typeof emailFormSchema>) => {
    setIsLoading(true)
    try {
      // Convert the data to FormData as expected by requestOtp
      const formData = new FormData()
      formData.append("email", data.email)

      await requestOtp(formData)
      setIsOTP(true)
      toast.success("OTP sent to your email")
    } catch (error) {
      toast.error("Failed to send OTP:\n" + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
    } catch (error) {
      toast.error("Failed to sign in with GitHub:\n" + (error as Error).message)
    }
  }

  const handleVerify = async (data: z.infer<typeof otpFormSchema>) => {
    setIsLoading(true)
    try {
      // Create FormData as expected by the route
      const formData = new FormData()
      formData.append("email", emailForm.getValues("email"))
      formData.append("otp", data.otp)

      const response = await fetch("/auth/confirm", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Verification failed")
      }

      toast.success("Login successful")
      router.push(routes.protected[0].path)
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          toast.error("Request timed out. Please try again.")
        } else if (error.message.includes("Failed to fetch")) {
          toast.error(
            "Network error. Please check your connection and try again."
          )
        } else {
          toast.error("Verification failed: " + error.message)
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isOTP) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(handleVerify)}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-2">
              <Link href="/" className="flex flex-col items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md">
                  <IconStackBackward className="size-10" />
                </div>
                <span className="sr-only">Acme Corporation</span>
              </Link>
              <h1 className="text-heading-20">Enter OTP</h1>
              <div className="text-copy-14 flex justify-center">
                We&apos;ve sent a code to {emailForm.getValues("email")}
              </div>
            </div>
            <div className="flex flex-col items-center gap-6">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">OTP Code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex w-full flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsOTP(false)
                    otpForm.reset()
                  }}
                  disabled={isLoading}
                >
                  Back to Email
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <Link href="/" className="flex flex-col items-center gap-2">
          <IconStackBackward className="size-10" />
          <span className="sr-only">Acme Corporation</span>
        </Link>
        <h1 className="text-heading-20">Welcome to Acme Corporation</h1>
        <div className="text-copy-14 flex justify-center">
          Login or sign up to continue.
        </div>
      </div>
      {/* Email Form */}
      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
          className="space-y-6"
        >
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full hover:cursor-pointer"
            disabled={isLoading || !emailForm.formState.isValid}
          >
            {isLoading ? "Sending OTP..." : "Request OTP"}
          </Button>
        </form>
      </Form>
      <div className="after:border-border text-copy-14 relative flex justify-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>

      {/* OAuth Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          variant="outline"
          type="button"
          className="w-full hover:cursor-pointer"
          onClick={() => handleGithubSignIn()}
        >
          <IconBrandGithub />
          GitHub
        </Button>
        <Button
          variant="outline"
          type="button"
          className="w-full hover:cursor-pointer"
        >
          <IconStackBackward />
          Acme
        </Button>
      </div>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-copy-12 flex justify-center text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <Link href="/">Terms of Service</Link> and{" "}
        <Link href="/">Privacy Policy</Link>.
      </div>
    </div>
  )
}
