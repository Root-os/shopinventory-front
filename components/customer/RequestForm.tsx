"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCustomerAuth } from "@/contexts/CustomerContext";

interface Item {
  id: number;
  name: string;
  unit: string;
}

interface SelectedItem {
  itemId: number;
  quantity: number;
  name: string;
}

export default function CustomerRequestForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { customer } = useCustomerAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/items`);
        const data = await res.json();
        setItems(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch items", variant: "destructive" });
      }
    };
    fetchItems();
  }, [toast]);

  const handleAddItem = (itemId: number, name: string) => {
    if (selectedItems.some((item) => item.itemId === itemId)) return;
    setSelectedItems((prev) => [...prev, { itemId, quantity: 1, name }]);
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, quantity } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer?.id,
          items: selectedItems.map(({ itemId, quantity }) => ({ itemId, quantity })),
          description,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit request");

      toast({ title: "Success", description: "Request submitted successfully" });
      setSelectedItems([]);
      setDescription("");
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a New Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why do you need these items?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Select Items</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="outline"
                  onClick={() => handleAddItem(item.id, item.name)}
                  disabled={selectedItems.some((si) => si.itemId === item.id)}
                >
                  {item.name} ({item.unit})
                </Button>
              ))}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="space-y-4">
              <Label>Selected Items</Label>
              {selectedItems.map(({ itemId, quantity, name }) => (
                <div key={itemId} className="flex items-center gap-4">
                  <span className="flex-1">{name}</span>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value))}
                    className="w-24"
                    required
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveItem(itemId)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || selectedItems.length === 0}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
