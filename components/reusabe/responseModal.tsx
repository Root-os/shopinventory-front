"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RespondModalProps {
  open: boolean
  onClose: () => void
  request: {
    id: number
    customerId: number
    description: string
  } | null
  onRespond: () => void
}

export default function RespondModal({
  open,
  onClose,
  request,
  onRespond,
}: RespondModalProps) {
  const [status, setStatus] = useState("confirmed")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!request) return
    setSubmitting(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/request/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          status,
          reason: reason.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error("Failed to submit response")

      onRespond()
      onClose()
    } catch (err) {
      console.error("Error responding:", err)
      alert("Failed to submit response")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Respond to Request #{request?.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Reason (optional)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for your decision"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Response"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
