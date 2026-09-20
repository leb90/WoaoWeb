Attribute VB_Name = "modBanco"
Option Explicit

'MODULO PROGRAMADO POR NEB
'Kevin Birmingham
'kbneb@hotmail.com

Sub IniciarDeposito(ByVal Userindex As Integer)

    On Error GoTo fallo

    'Hacemos un Update del inventario del usuario
    'Pluto:7.0 añado caja
    Call UpdateBanUserInv(True, Userindex, 0)
    'Atcualizamos el dinero
    Call SendUserStatsOro(Userindex)
    'Mostramos la ventana pa' comerciar y ver ladear la osamenta. jajaja
    SendData2 ToIndex, Userindex, 0, 11
    UserList(Userindex).flags.Comerciando = True

    Exit Sub
fallo:
    Call LogError("iniciardeposito " & Err.number & " D: " & Err.Description)

End Sub

Sub SendBanObj(Userindex As Integer, Slot As Byte, Object As UserOBJ)

    On Error GoTo fallo

    Dim Caja As Byte
    Caja = UserList(Userindex).flags.NCaja
    UserList(Userindex).BancoInvent(Caja).Object(Slot) = Object

    'pluto:6.0A
    If Object.ObjIndex > 0 Then
        Call SendData2(ToIndex, Userindex, 0, 33, Slot & "," & Object.ObjIndex & "," & Object.Amount)
    Else
        Call SendData2(ToIndex, Userindex, 0, 33, Slot & "," & "0")    ' & "," & "(None)" & "," & "0" & "," & "0")

    End If

    Exit Sub
fallo:
    Call LogError("senbanobj " & Err.number & " D: " & Err.Description)

End Sub

Sub UpdateBanUserInv(ByVal UpdateAll As Boolean, _
                     ByVal Userindex As Integer, _
                     ByVal Slot As Byte)

    On Error GoTo fallo

    Dim NullObj As UserOBJ
    Dim loopc As Byte
    Dim Caja As Byte
    Caja = UserList(Userindex).flags.NCaja

    'Actualiza un solo slot
    If Not UpdateAll Then

        'Actualiza el inventario
        If UserList(Userindex).BancoInvent(Caja).Object(Slot).ObjIndex > 0 Then
            Call SendBanObj(Userindex, Slot, UserList(Userindex).BancoInvent(Caja).Object(Slot))
        Else
            Call SendBanObj(Userindex, Slot, NullObj)

        End If

    Else

        'Actualiza todos los slots
        'pluto:7.0
        For loopc = 1 To MAX_BANCOINVENTORY_SLOTS

            'Actualiza el inventario
            If UserList(Userindex).BancoInvent(Caja).Object(loopc).ObjIndex > 0 Then
                Call SendBanObj(Userindex, loopc, UserList(Userindex).BancoInvent(Caja).Object(loopc))
            Else

                Call SendBanObj(Userindex, loopc, NullObj)

            End If

        Next loopc

    End If

    Exit Sub
fallo:
    Call LogError("Updatebanuserinv " & Err.number & " D: " & Err.Description)

End Sub

Sub UserRetiraItem(ByVal Userindex As Integer, _
                   ByVal i As Integer, _
                   ByVal Cantidad As Integer)

    On Error GoTo fallo

    If Cantidad < 1 Then Exit Sub
    Dim Caja As Byte
    Caja = UserList(Userindex).flags.NCaja
    Call SendUserStatsOro(Userindex)

    If UserList(Userindex).BancoInvent(Caja).Object(i).Amount > 0 Then
        If Cantidad > UserList(Userindex).BancoInvent(Caja).Object(i).Amount Then Cantidad = UserList( _
           Userindex).BancoInvent(Caja).Object(i).Amount
        'Agregamos el obj que compro al inventario
        Call UserReciveObj(Userindex, CInt(i), Cantidad)
        'Actualizamos el inventario del usuario
        Call UpdateUserInv(True, Userindex, 0)
        'Actualizamos el banco
        Call UpdateBanUserInv(True, Userindex, 0)
        'Actualizamos la ventana de comercio
        Call UpdateVentanaBanco(i, 0, Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("userretiraitem " & Err.number & " D: " & Err.Description)

End Sub

Sub UserReciveObj(ByVal Userindex As Integer, _
                  ByVal ObjIndex As Integer, _
                  ByVal Cantidad As Integer)

    On Error GoTo fallo

    Dim Slot As Integer
    Dim obji As Integer

    'pluto:2.15
    'If UserList(UserIndex).flags.TargetNpcTipo = 25 Then Exit Sub
    Dim Caja As Byte
    Caja = UserList(Userindex).flags.NCaja

    If UserList(Userindex).BancoInvent(Caja).Object(ObjIndex).Amount <= 0 Then Exit Sub

    obji = UserList(Userindex).BancoInvent(Caja).Object(ObjIndex).ObjIndex

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

        Call QuitarBancoInvItem(Userindex, CByte(ObjIndex), Cantidad)
    Else
        Call SendData(ToIndex, Userindex, 0, "P7")

    End If

    Exit Sub
fallo:
    Call LogError("Userrecibeobj " & Err.number & " D: " & Err.Description)

End Sub

Sub QuitarBancoInvItem(ByVal Userindex As Integer, _
                       ByVal Slot As Byte, _
                       ByVal Cantidad As Integer)

    On Error GoTo fallo

    Dim Caja As Byte
    Caja = UserList(Userindex).flags.NCaja
    Dim ObjIndex As Integer
    ObjIndex = UserList(Userindex).BancoInvent(Caja).Object(Slot).ObjIndex

    'Quita un Obj

    UserList(Userindex).BancoInvent(Caja).Object(Slot).Amount = UserList(Userindex).BancoInvent(Caja).Object( _
                                                                Slot).Amount - Cantidad

    If UserList(Userindex).BancoInvent(Caja).Object(Slot).Amount <= 0 Then
        'UserList(UserIndex).BancoInvent(Caja).NroItems = UserList(UserIndex).BancoInvent.NroItems - 1
        UserList(Userindex).BancoInvent(Caja).Object(Slot).ObjIndex = 0
        UserList(Userindex).BancoInvent(Caja).Object(Slot).Amount = 0

    End If

    Exit Sub
fallo:
    Call LogError("quitarbancoinvitem " & Err.number & " D: " & Err.Description)

End Sub

Sub UpdateVentanaBanco(ByVal Slot As Integer, _
                       ByVal NpcInv As Byte, _
                       ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData2(ToIndex, Userindex, 0, 71, Slot & "," & NpcInv)
    Exit Sub
fallo:
    Call LogError("updateventanabanco " & Err.number & " D: " & Err.Description)

End Sub

Sub UserDepositaItem(ByVal Userindex As Integer, _
                     ByVal Item As Integer, _
                     ByVal Cantidad As Integer)

    On Error GoTo fallo

    'El usuario deposita un item
    Call SendUserStatsOro(Userindex)

    'pluto:2.3
    If ObjData(UserList(Userindex).Invent.Object(Item).ObjIndex).OBJType = 60 And UserList( _
       Userindex).flags.TargetNpcTipo = 4 Then
        UserList(Userindex).flags.Comerciando = False
        Call SendData2(ToIndex, Userindex, 0, 9)
        Call SendData(ToIndex, Userindex, 0, "||No puedes dejar Mascotas en la Bóveda." & "´" & _
                                             FontTypeNames.FONTTYPE_WARNING)
        Exit Sub

    End If

    'pluto:6.3
    If ObjData(UserList(Userindex).Invent.Object(Item).ObjIndex).OBJType = 42 And UserList(Userindex).flags.Montura > _
       0 Then
        UserList(Userindex).flags.Comerciando = False
        Call SendData2(ToIndex, Userindex, 0, 9)
        Call SendData(ToIndex, Userindex, 0, "||No puedes dejar la Ropa mientras cabalgas." & "´" & _
                                             FontTypeNames.FONTTYPE_WARNING)
        Exit Sub

    End If

    If UserList(Userindex).Invent.Object(Item).Amount > 0 And UserList(Userindex).Invent.Object(Item).Equipped = 0 Then

        If Cantidad > 0 And Cantidad > UserList(Userindex).Invent.Object(Item).Amount Then Cantidad = UserList( _
           Userindex).Invent.Object(Item).Amount
        'Agregamos el obj que compro al inventario
        Call UserDejaObj(Userindex, CInt(Item), Cantidad)
        'Actualizamos el inventario del usuario
        Call UpdateUserInv(True, Userindex, 0)
        'Actualizamos el inventario del banco
        Call UpdateBanUserInv(True, Userindex, 0)
        'Actualizamos la ventana del banco

        Call UpdateVentanaBanco(Item, 1, Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("USErdepositaitem UI:" & Userindex & " D: " & Err.Description & " Item: " & Item & " Can: " & _
                  Cantidad)

End Sub

Sub UserDejaObj(ByVal Userindex As Integer, _
                ByVal ObjIndex As Integer, _
                ByVal Cantidad As Integer)

    On Error GoTo fallo

    Dim Slot As Integer
    Dim obji As Integer

    If Cantidad < 1 Then Exit Sub
    Dim Caja As Byte
    Caja = UserList(Userindex).flags.NCaja

    obji = UserList(Userindex).Invent.Object(ObjIndex).ObjIndex

    '¿Ya tiene un objeto de este tipo?
    Slot = 1

    Do Until UserList(Userindex).BancoInvent(Caja).Object(Slot).ObjIndex = obji And UserList(Userindex).BancoInvent( _
       Caja).Object(Slot).Amount + Cantidad <= MAX_INVENTORY_OBJS
        Slot = Slot + 1

        'pluto:7.0
        If Slot > MAX_BANCOINVENTORY_SLOTS Then
            Exit Do

        End If

    Loop

    'Sino se fija por un slot vacio antes del slot devuelto
    'pluto:7.0
    If Slot > MAX_BANCOINVENTORY_SLOTS Then
        Slot = 1

        Do Until UserList(Userindex).BancoInvent(Caja).Object(Slot).ObjIndex = 0
            Slot = Slot + 1

            'pluto:7.0
            If Slot > MAX_BANCOINVENTORY_SLOTS Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes mas espacio en el banco!!" & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
                Exit Do

            End If

        Loop
        'If Slot <= MAX_BANCOINVENTORY_SLOTS Then UserList(UserIndex).BancoInvent(Caja).NroItems = UserList(UserIndex).BancoInvent(caja).NroItems + 1

    End If

    If Slot <= MAX_BANCOINVENTORY_SLOTS Then    'Slot valido

        'Mete el obj en el slot
        If UserList(Userindex).BancoInvent(Caja).Object(Slot).Amount + Cantidad <= MAX_INVENTORY_OBJS Then

            'Menor que MAX_INV_OBJS
            UserList(Userindex).BancoInvent(Caja).Object(Slot).ObjIndex = obji
            UserList(Userindex).BancoInvent(Caja).Object(Slot).Amount = UserList(Userindex).BancoInvent(Caja).Object( _
                                                                        Slot).Amount + Cantidad

            Call QuitarUserInvItem(Userindex, CByte(ObjIndex), Cantidad)

        Else
            Call SendData(ToIndex, Userindex, 0, "||El banco no puede cargar tantos objetos." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If

    Else
        Call QuitarUserInvItem(Userindex, CByte(ObjIndex), Cantidad)

    End If

    Exit Sub
fallo:
    Call LogError("Userdejaobj " & Err.number & " D: " & Err.Description)

End Sub

