import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";
import { useCheckoutSubscription } from "@/hooks/checkoutSubscription";
import { useState } from "react";
import { cn } from "@/lib/utils";
import background from "@/assets/img/back.jpeg";

interface Plan {
    name: string;
    price: string;
}

const plans: Plan[] = [
    {
        name: "Monthly plan",
        price: "$99,00",
    },
    {
        name: "Yearly plan",
        price: "$649,00",
    }
];

const proFeatures = [
    {
        icon: <Check className="h-4 w-4 text-green-500" />,
        title: "Run unlimited ads",
        description: "Promote your business, products, or services without limits"
    },
    {
        icon: <Check className="h-4 w-4 text-green-500" />,
        title: "Advanced performance insights",
        description: "Track which ads drive sales, new customers, and website visitors"
    },
    {
        icon: <Check className="h-4 w-4 text-green-500" />,
        title: "AI-Powered Recommendations",
        description: "Get tailored suggestions for audiences, creatives, and budget optimization"
    },
    {
        icon: <Check className="h-4 w-4 text-green-500" />,
        title: "Multi-platform integration",
        description: "Connect with Google, Pinterest, Amazon, LinkedIn and more"
    },
];

interface SubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const { mutate: checkoutSubscription, isPending } = useCheckoutSubscription();

    function handleCheckout() {
        if (!selectedPlan) return;
        const planModel = selectedPlan.name === "Yearly plan" ? "YEARLY" : "MONTHLY";
        checkoutSubscription(planModel);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex p-0 gap-0 border-none sm:max-w-[80vw] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                <div className="hidden lg:flex w-[40%]">
                    <img
                        src={background}
                        alt="Pro Access"
                        className="w-full h-full object-cover object-right"
                    />
                </div>

                <div className="flex-1 p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-2xl">Pro Access</DialogTitle>
                        <DialogDescription className="text-sm">
                            Upgrade to run unlimited ads and unlock advanced tools to grow your business.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1">
                        {proFeatures.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="flex items-start gap-3">
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-8 h-8 flex items-center justify-center mt-1.5">
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-xs text-neutral-900 mb-1">{step.title}</h3>
                                        <h3 className="text-xs text-neutral-400 mb-1">{step.description}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={cn(
                                    "p-6 border rounded-lg relative cursor-pointer transition-all",
                                    "hover:border-primary/50",
                                    selectedPlan?.name === plan.name && "border-primary border-2"
                                )}
                                onClick={() => setSelectedPlan(plan)}
                            >
                                {plan.name === "Yearly plan" && (
                                    <Badge className="absolute -top-2 right-2 bg-primary">
                                        Best price
                                    </Badge>
                                )}
                                {plan.name === "Monthly plan" && (
                                    <Badge className="absolute -top-2 right-2 bg-blue-400">
                                        Most popular
                                    </Badge>
                                )}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                                        <p className="text-2xl font-bold mt-2">{plan.price}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {plan.name === "Monthly plan"
                                                ? "Perfect for individuals and small teams getting started"
                                                : "Save 35% annually for growing businesses"
                                            }
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "min-w-[20px] min-h-[20px] w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                        selectedPlan?.name === plan.name
                                            ? "border-primary bg-primary text-white"
                                            : "border-gray-300 bg-white"
                                    )}>
                                        {selectedPlan?.name === plan.name && (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 mt-8">
                        <Button
                            variant="default"
                            onClick={handleCheckout}
                            disabled={!selectedPlan || isPending}
                            className="w-full py-6 text-lg rounded-xl"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                `Assign ${selectedPlan?.name || 'plan'}`
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}