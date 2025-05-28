import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Zap, ArrowRightCircle, CircleDollarSign } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert"
import { useEffect, useState, ReactElement } from "react"
import { SubscriptionDialog } from "./SubscriptionDialog"
import { useSubscriptionStore } from "@/stores/subscription.store"
import { getSubscriptionInfo } from "@/processes/subscription"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/stores/user.store"

interface SubscriptionProps {
    billingHistory: Array<{
        invoice_number: string
        paid_at: string
        plan: {
            id: number
            name: string
            price: number
        }
        amount: number
    }>
}

export function Subscription({ billingHistory }: SubscriptionProps): ReactElement {
    const [dialogOpen, setDialogOpen] = useState(false)
    const navigate = useNavigate()

    const { setSubscriptionInfo } = useSubscriptionStore();

    const { data: subscriptionInfo, isLoading } = useQuery({
        queryKey: ['subscriptionInfo'],
        queryFn: () => getSubscriptionInfo(),
    })

    const userInfo = useUserStore((state) => state.userInfo)

    const isProPlan = userInfo?.isProPlan;

    useEffect(() => {
        if (subscriptionInfo) {
            setSubscriptionInfo(subscriptionInfo)
        }
    }, [subscriptionInfo, setSubscriptionInfo])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-4 gap-8 mb-5 w-full items-center">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground ml-1">Plano</p>
                                <Skeleton className="h-8 w-32 mt-1" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground ml-1">Custo Mensal</p>
                                <Skeleton className="h-8 w-24 mt-1" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground ml-1">Status</p>
                                <Skeleton className="h-8 w-20 mt-1" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground ml-1 mt-4">Última Fatura</p>
                                <Skeleton className="h-10 w-64 mt-1" />
                            </div>
                        </div>

                        <Separator className="w-full" />

                        <div className="grid grid-cols-4 gap-8 mb-6 mt-6 w-full">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground ml-1 mb-2">Última Fatura</p>
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground ml-1 mb-2">Próximo Pagamento</p>
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </div>
                        </div>

                        <Separator className="w-full" />

                        <div className="mt-6">
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-bold">Histórico de Faturas</CardTitle>
                        <Skeleton className="h-9 w-32" />
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[80px]" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!subscriptionInfo) {
        toast.error('Error fetching subscription info')
        navigate('/profile')
        return <></>
    }

    const { plan, status: rawStatus } = subscriptionInfo
    const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()

    const handleDownloadInvoice = (invoice: string) => {
        // Implementar lógica de download
        console.log(`Downloading invoice: ${invoice}`)
    }

    const handleDownloadAll = () => {
        // Implementar lógica de download de todos os invoices
        console.log("Downloading all invoices")
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-4 gap-8 mb-5 w-full">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Plan</p>
                            <p className="text-xl font-semibold">{plan?.name || 'Free'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                            <p className="text-xl font-semibold">{plan?.price ? `$${plan?.price}` : 'Free'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <p className="text-xl font-semibold">{status}</p>
                        </div>
                            {!isProPlan && (
                                <Button
                                    variant="outline"
                                    onClick={() => setDialogOpen(true)}
                                    className="px-6 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center gap-2"
                                >
                                    <span>Upgrade to Pro</span>
                                    <ArrowRightCircle className="h-4 w-4" />
                                </Button>
                            )}
                    </div>

                    <Separator className="w-full" />

                    {plan?.price && (
                        <div className="grid grid-cols-4 gap-8 mb-6 mt-6 w-full">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Bill</p>
                            <div className="flex flex-col">
                                <p className="text-xl font-semibold">{plan?.price ? `$${plan?.price}` : 'Free'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Next Payment Due</p>
                            <div className="flex flex-col">
                                <p className="text-xl font-semibold">{plan?.price ? `$${plan?.price}` : 'Free'}</p>
                            </div>
                        </div>

                        <div></div>
                    </div>
                    )}



                    <Separator className="w-full" />

                    <Alert className="mt-6 bg-blue-50 flex items-center cursor-pointer">
                        <Zap className="h-4 w-4 !text-blue-500 mt-1" />
                        <div className="flex items-center justify-between w-full">
                            <AlertDescription className="text-blue-500 mt-1">
                                Change your plan to get more monthly active users
                            </AlertDescription>
                            <ArrowRightCircle className="h-5 w-5 text-blue-500 mt-1 cursor-pointer" />
                        </div>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold">Billing History</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadAll}
                        className="gap-2"
                        disabled={isLoading || !billingHistory?.length}
                    >
                        <Download className="h-4 w-4" />
                        Download All
                    </Button>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <Table>
                        {billingHistory?.length > 0 && (
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                        )}
                        <TableBody>
                            {isLoading ? (
                                <>
                                    {[1,2,3].map((i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            ) : billingHistory?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8 px-4">
                                        <div className="flex flex-col items-center gap-3">
                                            <CircleDollarSign className="h-8 w-8 text-muted-foreground" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold">No payment history yet</p>
                                                <p className="text-xs font-medium text-muted-foreground">Your billing history will appear here</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                billingHistory?.map((invoice) => (
                                    <TableRow key={invoice.invoice_number}>
                                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                        <TableCell>{invoice.paid_at}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-500 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900 dark:text-blue-300 dark:ring-blue-300/10">
                                                {invoice.plan?.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{invoice.amount && `$${invoice.amount}` || 'Free'}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadInvoice(invoice.invoice_number)}
                                                className="hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <SubscriptionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    )
}