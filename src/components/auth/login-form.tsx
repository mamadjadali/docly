'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import {
  OTP_INVALID_CODE_MESSAGE,
  OTP_INVALID_PHONE_MESSAGE,
  OTP_RESEND_COOLDOWN_MS,
} from '@/lib/otp/constants'
import { isValidIranMobile, normalizePhone } from '@/lib/otp/phone'

type Step = 'phone' | 'otp'

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  async function requestCode(nextPhone: string) {
    const response = await fetch('/api/viewers/otp/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: nextPhone }),
      credentials: 'include',
    })

    const data = (await response.json().catch(() => ({}))) as {
      message?: string
      ok?: boolean
    }

    if (!response.ok) {
      throw new Error(data.message || OTP_INVALID_PHONE_MESSAGE)
    }

    setCooldown(Math.floor(OTP_RESEND_COOLDOWN_MS / 1000))
  }

  async function handlePhoneSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    const normalized = normalizePhone(phone)
    if (!normalized) {
      setError(OTP_INVALID_PHONE_MESSAGE)
      return
    }

    setPending(true)
    try {
      await requestCode(normalized)
      setPhone(normalized)
      setStep('otp')
      setCode('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : OTP_INVALID_PHONE_MESSAGE)
    } finally {
      setPending(false)
    }
  }

  async function verifyCode(nextCode: string) {
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/viewers/otp/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone, code: nextCode }),
        credentials: 'include',
      })

      const data = (await response.json().catch(() => ({}))) as {
        message?: string
        ok?: boolean
      }

      if (!response.ok || !data.ok) {
        setError(data.message || OTP_INVALID_CODE_MESSAGE)
        setCode('')
        return
      }

      router.replace('/')
      router.refresh()
    } catch {
      setError(OTP_INVALID_CODE_MESSAGE)
      setCode('')
    } finally {
      setPending(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || pending) return
    setError('')
    setPending(true)
    try {
      await requestCode(phone)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : OTP_INVALID_PHONE_MESSAGE)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-sm border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">ورود</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <form className="grid gap-4" onSubmit={handlePhoneSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="phone">شماره موبایل</Label>
              <Input
                autoComplete="tel"
                dir="ltr"
                id="phone"
                inputMode="tel"
                onChange={(event) => {
                  setPhone(event.target.value)
                  if (error) setError('')
                }}
                placeholder="09121234567"
                value={phone}
              />
              {phone && !isValidIranMobile(phone) && (
                <p className="text-sm text-destructive">{OTP_INVALID_PHONE_MESSAGE}</p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button disabled={pending || !isValidIranMobile(phone)} type="submit">
              {pending ? 'در حال ارسال...' : 'ارسال کد'}
            </Button>
          </form>
        ) : (
          <div className="grid gap-4">
            <div className="grid justify-items-center gap-3" dir="ltr">
              <InputOTP
                autoFocus
                disabled={pending}
                maxLength={6}
                onChange={(value) => {
                  setCode(value)
                  if (error) setError('')
                  if (value.length === 6) void verifyCode(value)
                }}
                value={code}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot index={index} key={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            <div className="flex flex-col gap-2">
              <Button
                disabled={pending || cooldown > 0}
                onClick={() => void handleResend()}
                type="button"
                variant="outline"
              >
                {cooldown > 0 ? `ارسال دوباره (${cooldown})` : 'ارسال دوباره'}
              </Button>
              <Button
                disabled={pending}
                onClick={() => {
                  setStep('phone')
                  setCode('')
                  setError('')
                }}
                type="button"
                variant="ghost"
              >
                تغییر شماره
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
