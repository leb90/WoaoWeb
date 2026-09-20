Attribute VB_Name = "ModBovedaClan"
Option Explicit

'MODULO PROGRAMADO POR HERACLES

Sub IniciarBovedaClan(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim number As Byte
    Dim n As Byte

    For n = 1 To 254

        If UCase$(NameClan(n)) = UCase$(UserList(Userindex).GuildInfo.GuildName) Then
            number = n
            Exit For

        End If

    Next

    If number = 0 Then Exit Sub
    'Hacemos un Update del inventario del clan
    Call UpdateClanUserInv(True, number, 0, Userindex)
    'Atcualizamos el dinero
    'Call SendUserStatsOro(UserIndex)
    'Mostramos la ventana pa' comerciar y ver ladear la osamenta. jajaja
    SendData2 ToIndex, Userindex, 0, 11
    UserList(Userindex).flags.Comerciando = True

    Exit Sub
fallo:
    Call LogError("iniciardeposito " & Err.number & " D: " & Err.Description)

End Sub

Sub SendClanObj(Userindex As Integer, Slot As Byte, Object As obj)

    On Error GoTo fallo

    'UserList(UserIndex).BancoInvent.Object(Slot) = Object
    'ObjetosClan(Number).ObjSlot(loopc) = Object

    If Object.ObjIndex > 0 Then
        Call SendData2(ToIndex, Userindex, 0, 33, Slot & "," & Object.ObjIndex & "," & Object.Amount)
    Else
        Call SendData2(ToIndex, Userindex, 0, 33, Slot & "," & "0")    ' & "," & "(None)" & "," & "0" & "," & "0")

    End If

    Exit Sub
fallo:
    Call LogError("senClanobj " & Err.number & " D: " & Err.Description)

End Sub

Sub UpdateClanUserInv(ByVal UpdateAll As Boolean, _
                      ByVal number As Byte, _
                      ByVal Slot As Byte, _
                      ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim NullObj As obj
    Dim loopc As Byte

    'Actualiza un solo slot ' DE MOMENTO VAMOS A POR TODOS LOS SLOTS-----------------
    If Not UpdateAll Then

        'Actualiza el inventario
        If ObjetosClan(number).ObjSlot(loopc).ObjIndex > 0 Then
            'Call SendClanObj(Userindex, Slot UserList(Userindex).BancoInvent.Object(Slot))
        Else

            'Call SendClanObj(Userindex, Slot, NullObj)
        End If

    Else

        'Actualiza todos los slots--------------------------------------------------------
        For loopc = 1 To MAX_BOVEDACLAN_SLOTS

            'Actualiza el inventario
            If ObjetosClan(number).ObjSlot(loopc).ObjIndex > 0 Then
                'If UserList(UserIndex).BancoInvent.Object(loopc).ObjIndex > 0 Then
                Call SendClanObj(Userindex, loopc, ObjetosClan(number).ObjSlot(loopc))
            Else

                Call SendClanObj(Userindex, loopc, NullObj)

            End If

        Next loopc

    End If

    Exit Sub
fallo:
    Call LogError("UpdateClanuserinv " & Err.number & " D: " & Err.Description)

End Sub

Sub UserRetiraItemClan(ByVal Userindex As Integer, _
                       ByVal i As Integer, _
                       ByVal Cantidad As Integer)

    On Error GoTo fallo

    Dim n As Byte
    Dim number As Byte

    For n = 1 To 255

        If UCase$(NameClan(n)) = UCase$(UserList(Userindex).GuildInfo.GuildName) Then
            number = n
            Exit For

        End If

    Next

    'pluto:6.0A
    If UserList(Userindex).GuildInfo.GuildPoints < 3000 Then
        Call SendData(ToIndex, Userindex, 0, _
                      "||Necesitas tener Rango de General para poder sacar objetos de la Bóveda del Clan." & "´" & _
                      FontTypeNames.FONTTYPE_pluto)
        Call UpdateVentanaBancoClan(i, 0, Userindex, number)
        Exit Sub

    End If

    If Cantidad < 1 Then Exit Sub

    Call SendUserStatsOro(Userindex)

    If ObjetosClan(number).ObjSlot(i).Amount > 0 Then
        If Cantidad > ObjetosClan(number).ObjSlot(i).Amount Then Cantidad = ObjetosClan(number).ObjSlot(i).Amount
        'Agregamos el obj que compro al inventario
        Call UserReciveObjClan(Userindex, CInt(i), Cantidad, number)
        'Actualizamos el inventario del usuario
        Call UpdateUserInv(True, Userindex, 0)
        'Actualizamos el banco
        Call UpdateClanUserInv(True, number, 0, Userindex)
        'Actualizamos la ventana de comercio
        Call UpdateVentanaBancoClan(i, 0, Userindex, number)

    End If

    Exit Sub
fallo:
    Call LogError("userretiraitemClan " & Err.number & " D: " & Err.Description)

End Sub

Sub UserReciveObjClan(ByVal Userindex As Integer, _
                      ByVal i As Integer, _
                      ByVal Cantidad As Integer, _
                      ByVal number As Byte)

    On Error GoTo fallo

    Dim Slot As Integer
    Dim obji As Integer

    'pluto:2.15
    'If UserList(UserIndex).flags.TargetNpcTipo = 25 Then Exit Sub

    If ObjetosClan(number).ObjSlot(i).Amount <= 0 Then Exit Sub

    obji = ObjetosClan(number).ObjSlot(i).ObjIndex

    '¿Ya tiene un objeto de este tipo?
    Slot = 1

    Do Until UserList(Userindex).Invent.Object(Slot).ObjIndex = obji And UserList(Userindex).Invent.Object( _
       Slot).Amount + Cantidad <= MAX_INVENTORY_OBJS

        Slot = Slot + 1

        If Slot > MAX_INVENTORY_SLOTS Then
            Exit Do

        End If

    Loop

    'Sino se fija por un slot vacio
    If Slot > MAX_INVENTORY_SLOTS Then
        Slot = 1

        Do Until UserList(Userindex).Invent.Object(Slot).ObjIndex = 0
            Slot = Slot + 1

            If Slot > MAX_INVENTORY_SLOTS Then
                Call SendData(ToIndex, Userindex, 0, "P7")
                Exit Sub

            End If

        Loop
        UserList(Userindex).Invent.NroItems = UserList(Userindex).Invent.NroItems + 1

    End If

    'Mete el obj en el slot
    If UserList(Userindex).Invent.Object(Slot).Amount + Cantidad <= MAX_INVENTORY_OBJS Then

        'Menor que MAX_INV_OBJS
        UserList(Userindex).Invent.Object(Slot).ObjIndex = obji
        UserList(Userindex).Invent.Object(Slot).Amount = UserList(Userindex).Invent.Object(Slot).Amount + Cantidad
        'pluto:2.4.5
        UserList(Userindex).Stats.Peso = UserList(Userindex).Stats.Peso + (ObjData(UserList(Userindex).Invent.Object( _
                                                                                   Slot).ObjIndex).Peso * Cantidad)
        Call SendUserStatsPeso(Userindex)

        Call QuitarClanInvItem(number, Userindex, CByte(i), Cantidad)
    Else
        Call SendData(ToIndex, Userindex, 0, "P7")

    End If

    Exit Sub
fallo:
    Call LogError("UserrecibeobjClan " & Err.number & " D: " & Err.Description)

End Sub

Sub QuitarClanInvItem(ByVal number As Byte, _
                      ByVal Userindex As Integer, _
                      ByVal i As Byte, _
                      ByVal Cantidad As Integer)

    On Error GoTo fallo

    'Dim ObjIndex As Integer
    'ObjIndex = ObjetosClan(number).ObjSlot(i).ObjIndex

    'Quita un Obj

    ObjetosClan(number).ObjSlot(i).Amount = ObjetosClan(number).ObjSlot(i).Amount - Cantidad

    If ObjetosClan(number).ObjSlot(i).Amount <= 0 Then
        'UserList(Userindex).BancoInvent.NroItems = UserList(Userindex).BancoInvent.NroItems - 1
        ObjetosClan(number).ObjSlot(i).ObjIndex = 0
        ObjetosClan(number).ObjSlot(i).Amount = 0

    End If

    'actualiza fichero dat de clanes-------------
    Dim userfile2 As String
    userfile2 = App.Path & "\Guilds\" & NameClan(number) & "-Boveda.dat"
    Call WriteVar(userfile2, "Boveda", "Obj" & i, ObjetosClan(number).ObjSlot(i).ObjIndex & "-" & ObjetosClan( _
                                                  number).ObjSlot(i).Amount)
    '------------------------------------------
    Exit Sub
fallo:
    Call LogError("quitarClaninvitem " & Err.number & " D: " & Err.Description)

End Sub

Sub UpdateVentanaBancoClan(ByVal Slot As Integer, _
                           ByVal NpcInv As Byte, _
                           ByVal Userindex As Integer, _
                           ByVal number As Byte)

    On Error GoTo fallo

    Call SendData2(ToIndex, Userindex, 0, 71, Slot & "," & NpcInv)
    Exit Sub
fallo:
    Call LogError("updateventanabancoClan " & Err.number & " D: " & Err.Description)

End Sub

Sub UserDepositaItemClan(ByVal Userindex As Integer, _
                         ByVal Item As Integer, _
                         ByVal Cantidad As Integer)

    On Error GoTo fallo

    Dim n As Byte
    Dim number As Byte

    For n = 1 To 255

        If UCase$(NameClan(n)) = UCase$(UserList(Userindex).GuildInfo.GuildName) Then
            number = n
            Exit For

        End If

    Next
    'El usuario deposita un item
    Call SendUserStatsOro(Userindex)

    'pluto:2.3
    If ObjData(UserList(Userindex).Invent.Object(Item).ObjIndex).OBJType = 60 Then
        UserList(Userindex).flags.Comerciando = False
        Call SendData2(ToIndex, Userindex, 0, 9)
        Call SendData(ToIndex, Userindex, 0, "||No puedes dejar Mascotas en la Bóveda." & "´" & _
                                             FontTypeNames.FONTTYPE_WARNING)
        Exit Sub

    End If

    If UserList(Userindex).Invent.Object(Item).Amount > 0 And UserList(Userindex).Invent.Object(Item).Equipped = 0 Then

        If Cantidad > 0 And Cantidad > UserList(Userindex).Invent.Object(Item).Amount Then Cantidad = UserList( _
           Userindex).Invent.Object(Item).Amount
        'Agregamos el obj que compro al inventario
        Call UserDejaObjClan(Userindex, CInt(Item), Cantidad, number)
        'Actualizamos el inventario del usuario
        Call UpdateUserInv(True, Userindex, 0)
        'Actualizamos el inventario del banco
        Call UpdateClanUserInv(True, number, 0, Userindex)
        'Actualizamos la ventana del banco

        Call UpdateVentanaBanco(Item, 1, Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("USErdepositaitemClan UI:" & Userindex & " D: " & Err.Description & " Item: " & Item & " Can: " & _
                  Cantidad)

End Sub

Sub UserDejaObjClan(ByVal Userindex As Integer, _
                    ByVal ObjIndex As Integer, _
                    ByVal Cantidad As Integer, _
                    ByVal number As Byte)

    On Error GoTo fallo

    Dim Slot As Integer
    Dim obji As Integer

    If Cantidad < 1 Then Exit Sub

    obji = UserList(Userindex).Invent.Object(ObjIndex).ObjIndex

    '¿Ya tiene un objeto de este tipo?
    Slot = 1

    Do Until ObjetosClan(number).ObjSlot(Slot).ObjIndex = obji And ObjetosClan(number).ObjSlot(Slot).Amount + _
       Cantidad <= MAX_INVENTORY_OBJS
        Slot = Slot + 1

        If Slot > MAX_BOVEDACLAN_SLOTS Then
            Exit Do

        End If

    Loop

    'Sino se fija por un slot vacio antes del slot devuelto
    If Slot > MAX_BOVEDACLAN_SLOTS Then
        Slot = 1

        Do Until ObjetosClan(number).ObjSlot(Slot).ObjIndex = 0
            Slot = Slot + 1

            If Slot > MAX_BOVEDACLAN_SLOTS Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes mas espacio en Boveda Clan!!" & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
                Exit Do

            End If

        Loop
        'If Slot <= MAX_BOVEDACLAN_SLOTS Then UserList(Userindex).BancoInvent.NroItems = UserList(Userindex).BancoInvent.NroItems + 1

    End If

    If Slot <= MAX_BOVEDACLAN_SLOTS Then    'Slot valido

        'Mete el obj en el slot
        If ObjetosClan(number).ObjSlot(Slot).Amount + Cantidad <= MAX_INVENTORY_OBJS Then

            'Menor que MAX_INV_OBJS
            ObjetosClan(number).ObjSlot(Slot).ObjIndex = obji
            ObjetosClan(number).ObjSlot(Slot).Amount = ObjetosClan(number).ObjSlot(Slot).Amount + Cantidad
            'actualiza fichero dat de clanes-------------
            Dim userfile2 As String
            userfile2 = App.Path & "\Guilds\" & NameClan(number) & "-Boveda.dat"
            Call WriteVar(userfile2, "Boveda", "Obj" & Slot, ObjetosClan(number).ObjSlot(Slot).ObjIndex & "-" & _
                                                             ObjetosClan(number).ObjSlot(Slot).Amount)
            '------------------------------------------
            Call QuitarUserInvItem(Userindex, CByte(ObjIndex), Cantidad)

        Else
            Call SendData(ToIndex, Userindex, 0, "||El Clan no puede cargar tantos objetos." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If

    Else
        Call QuitarUserInvItem(Userindex, CByte(ObjIndex), Cantidad)

    End If

    Exit Sub
fallo:
    Call LogError("UserdejaobjClan " & Err.number & " D: " & Err.Description)

End Sub

