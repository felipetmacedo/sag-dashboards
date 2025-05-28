"use client"
import { Gift, Link, Loader2, CalendarIcon, Search, Check, UserPlus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TooltipContent, TooltipTrigger, TooltipProvider, Tooltip } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import InvitationContainer from "./Invitation.container"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function Invitation() {
  const {
    invitationLink,
    loading,
    copied,
    handleCopyLink,
    searchQuery,
    setSearchQuery,
    selectedUsers,
    setSelectedUsers,
    indicationValue,
    valueError,
    dialogOpen,
    setDialogOpen,
    hasOwnRequestValue,
    filteredUsers,
    toggleUserSelection,
    toggleSelectAll,
    handleValueChange,
    handleSetIndicationValue,
    isSettingIndicationValue,
  } = InvitationContainer()

  return (
    <div className="p-6 flex flex-col space-y-6 mx-auto">
      {/* Invitation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="md:col-span-1">
          <Card className="shadow-md bg-gradient-to-br from-yellow-50 to-white border-yellow-200 w-full h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-yellow-700 flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow-500" />
                Seu Valor de por nome
              </CardTitle>
              <CardDescription className="text-yellow-600">Valor definido para suas indicações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                {hasOwnRequestValue ? (
                  <>
                    <div className="text-4xl font-bold text-yellow-700 mb-2">{indicationValue}</div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Check className="h-3.5 w-3.5 mr-1" /> Valor Definido
                    </Badge>
                  </>
                ) : (
                  <>
                    <div className="text-xl text-yellow-600 mb-2 text-center">Aguardando definição de valor</div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                      Pendente
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-yellow-100 pt-4">
              <p className="text-xs text-center text-yellow-600">
                Para cada nome na plataforma, o valor por nome quem vai definir é você. O valor excedente será seu, menos as taxas
              </p>
            </CardFooter>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-md w-full h-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                <Gift className="h-6 w-6" />
                Programa de Indicação
              </CardTitle>
              <CardDescription>
                Para cada membro, o valor por nome quem vai definir é você. O valor excedente será seu, menos as taxas
                da aplicação.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex items-center justify-between space-x-4">
              <div className="flex flex-col space-y-2 flex-1">
                <label htmlFor="invitation-link" className="text-sm font-medium">
                  Seu Link de Convite
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="invitation-link"
                      type="text"
                      value={loading ? "Carregando link..." : invitationLink}
                      className="pl-10 pr-4 py-2"
                      readOnly
                    />
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    disabled={loading}
                    className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {copied ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              Ajude a crescer nossa comunidade e ganhe recompensas!
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="default"
                        onClick={() => setDialogOpen(true)}
                        disabled={selectedUsers.length === 0 || !hasOwnRequestValue}
                        className="whitespace-nowrap"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Definir Valor de Indicação
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!hasOwnRequestValue && (
                    <TooltipContent className="max-w-xs">
                      <p>
                        Você precisa ter seu próprio valor de indicação definido antes de definir valores para outros.
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Definir Valor de Indicação</DialogTitle>
                <DialogDescription>
                  Defina o valor de indicação para {selectedUsers.length} usuário(s) selecionado(s). Uma vez definido,
                  não pode ser alterado.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <label htmlFor="indication-value" className="text-sm font-medium block mb-2">
                  Valor de Indicação
                </label>
                <div className="space-y-2">
                  <Input
                    id="indication-value"
                    type="number"
                    placeholder="0.00"
                    value={indicationValue}
                    onChange={handleValueChange}
                    className={valueError ? "border-red-500" : ""}
                  />
                  {valueError && <p className="text-sm text-red-500">{valueError}</p>}
                  {selectedUsers.length === 1 &&
                    filteredUsers.find((user) => selectedUsers.includes(user.id))?.request_value && (
                      <p className="text-sm text-muted-foreground">
                        Valor atual: {filteredUsers.find((user) => selectedUsers.includes(user.id))?.request_value}
                      </p>
                    )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={handleSetIndicationValue}
                  disabled={!indicationValue || valueError !== "" || isSettingIndicationValue}
                >
                  {isSettingIndicationValue ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando
                    </>
                  ) : (
                    "Definir Valor"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? "Nenhum usuário encontrado para esta busca" : "Nenhum usuário encontrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Valor de Indicação</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((member) => (
                    <TableRow
                      key={member.id}
                      className={`hover:bg-yellow-50 ${
                        member.request_value !== null && member.request_value !== undefined ? "opacity-75" : ""
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(member.id)}
                          onCheckedChange={() => toggleUserSelection(member.id)}
                          aria-label={`Select ${member.user.name}`}
                          disabled={member.request_value !== null && member.request_value !== undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-yellow-200 bg-yellow-50">
                            <AvatarFallback className="bg-yellow-100 text-yellow-800">
                              {member.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{member.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5 text-yellow-600" />
                                <span>{format(new Date(member.user.created_at), "dd/MM/yyyy")}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Data de cadastro</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        {member.request_value ? (
                          <div className="font-medium text-yellow-700">{member.request_value}</div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">Não definido</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Indicado
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Users Summary */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-yellow-200 z-10">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span className="font-medium">{selectedUsers.length} usuário(s) selecionado(s)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      size="sm"
                      onClick={() => setDialogOpen(true)}
                      className="ml-2"
                      disabled={!hasOwnRequestValue}
                    >
                      Definir Valor
                    </Button>
                  </span>
                </TooltipTrigger>
                {!hasOwnRequestValue && (
                  <TooltipContent className="max-w-xs">
                    <p>
                      Você precisa ter seu próprio valor de indicação definido pelo seu indicador antes de definir
                      valores para outros.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Button size="sm" variant="outline" onClick={() => setSelectedUsers([])}>
              Limpar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
