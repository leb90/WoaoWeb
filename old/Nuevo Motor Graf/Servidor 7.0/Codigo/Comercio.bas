Attribute VB_Name = "Comercio"
Option Explicit

Sub UserCompraObj(ByVal Userindex As Integer, ByVal ObjIndex As Integer, ByVal NpcIndex As Integer, ByVal Cantidad As Integer)

    On Error GoTo fallo

    Dim infla     As Long
    Dim Descuento As String
    Dim unidad    As Long, monto As Long
    Dim Slot      As Integer
    Dim obji      As Integer
    Dim Encontre  As Boolean

    If (Npclist(UserList(Userindex).flags.TargetNpc).Invent.Object(ObjIndex).Amount <= 0) Then Exit Sub

    obji = Npclist(UserList(Userindex).flags.TargetNpc).Invent.Object(ObjIndex).ObjIndex

    If ObjData(obji).OBJType = OBJTYPE_LLAVES And LlaveCuenta(Userindex) = 0 Then
        Cuentas(Userindex).Llave = ObjData(obji).Clave
        infla = (Npclist(NpcIndex).Inflacion * ObjData(obji).Valor) \ 100

        'pluto:2.17------------
        If MapInfo(UserList(Userindex).Pos.Map).Dueño = 1 And Criminal(Userindex) Then infla = infla * 10

        If MapInfo(UserList(Userindex).Pos.Map).Dueño = 2 And Not Criminal(Userindex) Then infla = infla * 10
        '----------------------

        Descuento = UserList(Userindex).flags.Descuento

        If Descuento = 0 Then Descuento = 1    'evitamos dividir por 0!
        unidad = ((ObjData(Npclist(NpcIndex).Invent.Object(ObjIndex).ObjIndex).Valor + infla) / Descuento)

        If unidad < 1 Then unidad = 1
        monto = unidad * Cantidad
        UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - monto
        Call QuitarNpcInvItem(UserList(Userindex).flags.TargetNpc, CByte(ObjIndex), Cantidad)
        Call logVentaCasa(UserList(Userindex).Name & " compro " & ObjData(obji).Name)
        Call SendData(ToIndex, Userindex, 0, "||Has comprado una casita :P" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
        Exit Sub

    End If

    If ObjData(obji).OBJType = OBJTYPE_LLAVES Then
        Call SendData(ToIndex, Userindex, 0, "||Ya tenes una casa." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
        Exit Sub

    End If

    '¿Ya tiene un objeto de este tipo?
    Slot = 1

    Do Until UserList(Userindex).Invent.Object(Slot).ObjIndex = obji And UserList(Userindex).Invent.Object(Slot).Amount + Cantidad <= MAX_INVENTORY_OBJS

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

        'pluto:2.4.1
        If UserList(Userindex).Stats.Peso + (Cantidad * ObjData(obji).Peso) > UserList(Userindex).Stats.PesoMax Then
            Call SendData(ToIndex, Userindex, 0, "P6")
            Exit Sub

        End If

        'Menor que MAX_INV_OBJS
        UserList(Userindex).Invent.Object(Slot).ObjIndex = obji
        UserList(Userindex).Invent.Object(Slot).Amount = UserList(Userindex).Invent.Object(Slot).Amount + Cantidad

        UserList(Userindex).Stats.Peso = UserList(Userindex).Stats.Peso + (Cantidad * ObjData(obji).Peso)
        Call SendUserStatsPeso(Userindex)

        'pluto:2-3-04
        If Npclist(NpcIndex).Comercia = 1 Then
            'Le sustraemos el valor en oro del obj comprado
            infla = (Npclist(NpcIndex).Inflacion * ObjData(obji).Valor) \ 100

            'pluto:2.17------------
            If MapInfo(UserList(Userindex).Pos.Map).Dueño = 1 And Criminal(Userindex) Then infla = infla * 10

            If MapInfo(UserList(Userindex).Pos.Map).Dueño = 2 And Not Criminal(Userindex) Then infla = infla * 10
            '----------------------

            Descuento = UserList(Userindex).flags.Descuento

            If Descuento = 0 Then Descuento = 1    'evitamos dividir por 0!
            unidad = ((ObjData(Npclist(NpcIndex).Invent.Object(ObjIndex).ObjIndex).Valor + infla) / Descuento)

            'pluto:6.8-------------
            If EventoDia = 5 Then
                unidad = unidad - Porcentaje(unidad, 20)

            End If

            '-------------------------------
            If unidad < 1 Then unidad = 1
            monto = unidad * Cantidad
            UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - monto
            'tal vez suba el skill comerciar ;-)
            Call SubirSkill(Userindex, Comerciar)

        End If

        If Npclist(NpcIndex).Comercia = 2 Then
            'Le sustraemos el valor en puntos del obj comprado
            infla = (Npclist(NpcIndex).Inflacion * ObjData(obji).Valor) \ 100

            'pluto:2.17------------
            If MapInfo(UserList(Userindex).Pos.Map).Dueño = 1 And Criminal(Userindex) Then infla = infla * 10

            If MapInfo(UserList(Userindex).Pos.Map).Dueño = 2 And Not Criminal(Userindex) Then infla = infla * 10
            '----------------------

            Descuento = UserList(Userindex).flags.Descuento

            If Descuento = 0 Then Descuento = 1    'evitamos dividir por 0!
            unidad = ((ObjData(Npclist(NpcIndex).Invent.Object(ObjIndex).ObjIndex).Valor + infla) / Descuento)

            'pluto:6.8-------------
            If EventoDia = 5 Then
                unidad = unidad - Porcentaje(unidad, 20)

            End If

            '-------------------------------
            monto = unidad * Cantidad
            UserList(Userindex).Stats.Puntos = UserList(Userindex).Stats.Puntos - monto
            Dim PuntosC As Integer
            PuntosC = UserList(Userindex).Stats.Puntos
            Call SendData(ToIndex, Userindex, 0, "J5" & PuntosC)

        End If

        '    If UserList(UserIndex).Stats.GLD < 0 Then UserList(UserIndex).Stats.GLD = 0

        Call QuitarNpcInvItem(UserList(Userindex).flags.TargetNpc, CByte(ObjIndex), Cantidad)
    Else
        Call SendData(ToIndex, Userindex, 0, "P7")

    End If

    Exit Sub
fallo:
    Call LogError("USERCOMPRAOBJ " & UserList(Userindex).Name & "npc: " & Npclist(NpcIndex).Name & " obj: " & ObjIndex & " can: " & Cantidad & " " & Err.number & " D: " & Err.Description)

End Sub

Sub NpcCompraObj(ByVal Userindex As Integer, ByVal ObjIndex As Integer, ByVal Cantidad As Integer)

    On Error GoTo fallo

    Dim Slot     As Integer
    Dim obji     As Integer
    Dim NpcIndex As Integer
    Dim infla    As Long
    Dim monto    As Long

    If Cantidad < 1 Then Exit Sub

    NpcIndex = UserList(Userindex).flags.TargetNpc
    obji = UserList(Userindex).Invent.Object(ObjIndex).ObjIndex

    'pluto:2-3-04
    If Npclist(NpcIndex).Comercia <> 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No compro Objetos." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If ObjData(obji).Newbie = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No comercio objetos para newbies." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If Npclist(NpcIndex).TipoItems <> OBJTYPE_CUALQUIERA And Npclist(NpcIndex).TipoItems <> 888 Then

        '¿Son los items con los que comercia el npc?
        If Npclist(NpcIndex).TipoItems <> ObjData(obji).OBJType Then
            Call SendData(ToIndex, Userindex, 0, "||El npc no esta interesado en comprar ese objeto." & "´" & FontTypeNames.FONTTYPE_WARNING)
            Exit Sub

        End If

    End If

    'pluto:2.17
    If Npclist(NpcIndex).TipoItems = 888 And (ObjData(obji).Real = 0 Or ObjData(obji).Vendible = 1) Then
        Call SendData(ToIndex, Userindex, 0, "||El npc no esta interesado en comprar ese objeto." & "´" & FontTypeNames.FONTTYPE_WARNING)
        Exit Sub

    End If

    'pluto:2.4.1
    If ObjData(obji).OBJType = 60 Then
        Call SendData(ToIndex, Userindex, 0, "||El npc no esta interesado en comprar ese objeto." & "´" & FontTypeNames.FONTTYPE_WARNING)
        Exit Sub

    End If

    'pluto:2.8.0
    If ObjData(obji).Vendible = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||El npc no esta interesado en comprar ese objeto." & "´" & FontTypeNames.FONTTYPE_WARNING)
        Exit Sub

    End If

    '¿Ya tiene un objeto de este tipo?
    Slot = 1

    Do Until Npclist(NpcIndex).Invent.Object(Slot).ObjIndex = obji And Npclist(NpcIndex).Invent.Object(Slot).Amount + Cantidad <= MAX_INVENTORY_OBJS
        Slot = Slot + 1

        If Slot > MAX_INVENTORY_SLOTS Then
            Exit Do

        End If

    Loop

    'Sino se fija por un slot vacio antes del slot devuelto
    If Slot > MAX_INVENTORY_SLOTS Then
        Slot = 1

        Do Until Npclist(NpcIndex).Invent.Object(Slot).ObjIndex = 0
            Slot = Slot + 1

            If Slot > MAX_INVENTORY_SLOTS Then
                '                Call SendData(ToIndex, NpcIndex, 0, "||El npc no puede cargar mas objetos." & FONTTYPENAMES.FONTTYPE_INFO)
                '                Exit Sub
                Exit Do

            End If

        Loop

        If Slot <= MAX_INVENTORY_SLOTS Then Npclist(NpcIndex).Invent.NroItems = Npclist(NpcIndex).Invent.NroItems + 1

    End If

    If Slot <= MAX_INVENTORY_SLOTS Then    'Slot valido

        'Mete el obj en el slot
        If Npclist(NpcIndex).Invent.Object(Slot).Amount + Cantidad <= MAX_INVENTORY_OBJS Then

            'Menor que MAX_INV_OBJS
            Npclist(NpcIndex).Invent.Object(Slot).ObjIndex = obji
            Npclist(NpcIndex).Invent.Object(Slot).Amount = Npclist(NpcIndex).Invent.Object(Slot).Amount + Cantidad

            Call QuitarUserInvItem(Userindex, CByte(ObjIndex), Cantidad)
            'Le sumamos al user el valor en oro del obj vendido
            monto = ((ObjData(obji).Valor \ 3 + infla) * Cantidad)
            Call AddtoVar(UserList(Userindex).Stats.GLD, monto, MAXORO)
            'tal vez suba el skill comerciar ;-)
            Call SubirSkill(Userindex, Comerciar)

        Else
            Call SendData(ToIndex, Userindex, 0, "||El npc no puede cargar tantos objetos." & "´" & FontTypeNames.FONTTYPE_INFO)

        End If

    Else
        Call QuitarUserInvItem(Userindex, CByte(ObjIndex), Cantidad)
        'Le sumamos al user el valor en oro del obj vendido
        monto = ((ObjData(obji).Valor \ 3 + infla) * Cantidad)
        Call AddtoVar(UserList(Userindex).Stats.GLD, monto, MAXORO)

    End If

    Exit Sub
fallo:
    Call LogError("NPCCOMPRAOBJ" & Err.number & " D: " & Err.Description)

End Sub

Sub IniciarCOmercioNPC(ByVal Userindex As Integer)

    On Error GoTo fallo

    'Mandamos el Inventario
    Call EnviarNpcInv(Userindex, UserList(Userindex).flags.TargetNpc)
    'Hacemos un Update del inventario del usuario
    Call UpdateUserInv(True, Userindex, 0)
    'Atcualizamos el dinero
    Call SendUserStatsOro(Userindex)
    'Mostramos la ventana pa' comerciar y ver ladear la osamenta. jajaja
    SendData2 ToIndex, Userindex, 0, 10
    UserList(Userindex).flags.Comerciando = True

    Exit Sub
fallo:
    Call LogError("INICIARCOMERCIONPC" & Err.number & " D: " & Err.Description)

End Sub

Sub NPCVentaItem(ByVal Userindex As Integer, ByVal i As Integer, ByVal Cantidad As Integer, ByVal NpcIndex As Integer)

    On Error GoTo fallo

    Dim infla As Long
    Dim val   As Long
    Dim Desc  As String

    'pluto:2.10
    If Cantidad < 1 Or NpcIndex < 1 Or Userindex < 1 Or i < 0 Or i > 20 Then Exit Sub

    'NPC VENDE UN OBJ A UN USUARIO
    Call SendUserStatsOro(Userindex)
    'Calculamos el valor unitario
    infla = Int((Npclist(NpcIndex).Inflacion * ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).Valor) / 100)

    'pluto:2.17------------
    If MapInfo(UserList(Userindex).Pos.Map).Dueño = 1 And Criminal(Userindex) Then infla = infla * 10

    If MapInfo(UserList(Userindex).Pos.Map).Dueño = 2 And Not Criminal(Userindex) Then infla = infla * 10
    '----------------------

    Desc = Descuento(Userindex)

    If Desc = 0 Then Desc = 1    'evitamos dividir por 0!
    val = (ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).Valor + infla) / Desc

    'pluto:6.8-------------
    If EventoDia = 5 Then
        val = val - Porcentaje(val, 20)

    End If

    '-------------------------------

    If val < 1 Then val = 1

    'pluto:2-3-04
    If (UserList(Userindex).Stats.GLD >= (val * Cantidad) And Npclist(NpcIndex).Comercia = 1) Or (UserList(Userindex).Stats.Puntos >= (val * Cantidad) And Npclist(NpcIndex).Comercia = 2) Then

        If Npclist(UserList(Userindex).flags.TargetNpc).Invent.Object(i).Amount > 0 Then

            If UserList(Userindex).flags.Privilegios > 0 And UserList(Userindex).flags.Privilegios < 3 Then Exit Sub

            If Cantidad > Npclist(UserList(Userindex).flags.TargetNpc).Invent.Object(i).Amount Then Cantidad = Npclist(UserList(Userindex).flags.TargetNpc).Invent.Object(i).Amount
            'Agregamos el obj que compro al inventario
            Call UserCompraObj(Userindex, CInt(i), UserList(Userindex).flags.TargetNpc, Cantidad)
            'Actualizamos el inventario del usuario
            Call UpdateUserInv(True, Userindex, 0)
            'Actualizamos el oro
            Call SendUserStatsOro(Userindex)
            'Actualizamos la ventana de comercio
            Call EnviarNpcInv(Userindex, UserList(Userindex).flags.TargetNpc)
            Call UpdateVentanaComercio(i, 0, Userindex)

        End If

    Else

        'pluto:2-3-04
        If Npclist(NpcIndex).Comercia = 1 Then Call SendData(ToIndex, Userindex, 0, "||No tenes suficiente Oro." & "´" & FontTypeNames.FONTTYPE_INFO) Else Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes Puntos de Canje." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    Exit Sub
fallo:
    'pluto:2.10
    Call LogError("NPCVENTAITEM Npc:" & Npclist(NpcIndex).Name & " NpcIndex: " & NpcIndex & " Jug: " & UserList(Userindex).Name & " " & Err.number & " D: " & Err.Description & "Obj: " & i & "Cant: " & Cantidad & "TipoNpc: " & Npclist(NpcIndex).NPCtype)

End Sub

Sub NPCCompraItem(ByVal Userindex As Integer, ByVal Item As Integer, ByVal Cantidad As Integer)

    On Error GoTo fallo

    'NPC COMPRA UN OBJ A UN USUARIO
    Call SendUserStatsOro(Userindex)

    'pluto:vender oro
    If UserList(Userindex).Invent.Object(Item).ObjIndex = 12 Then Exit Sub
    'pluto:fin vender oro

    If UserList(Userindex).Invent.Object(Item).Amount > 0 And UserList(Userindex).Invent.Object(Item).Equipped = 0 Then

        If Cantidad > 0 And Cantidad > UserList(Userindex).Invent.Object(Item).Amount Then Cantidad = UserList(Userindex).Invent.Object(Item).Amount
        'Agregamos el obj que compro al inventario
        Call NpcCompraObj(Userindex, CInt(Item), Cantidad)
        'Actualizamos el inventario del usuario
        Call UpdateUserInv(True, Userindex, 0)
        'Actualizamos el oro
        Call SendUserStatsOro(Userindex)
        Call EnviarNpcInv(Userindex, UserList(Userindex).flags.TargetNpc)
        'Actualizamos la ventana de comercio

        Call UpdateVentanaComercio(Item, 1, Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("NPCCOMPRAITEM" & Err.number & " D: " & Err.Description)

End Sub

Sub UpdateVentanaComercio(ByVal Slot As Integer, ByVal NpcInv As Byte, ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData2(ToIndex, Userindex, 0, 70, Slot & "," & NpcInv)

    Exit Sub
fallo:
    Call LogError("UPDATEVENTANACOMERCIO" & Err.number & " D: " & Err.Description)

End Sub

Function Descuento(ByVal Userindex As Integer) As String

    On Error GoTo fallo

    'Establece el descuento en funcion del skill comercio
    Dim PtsComercio As Integer
    PtsComercio = CInt(UserList(Userindex).Stats.UserSkills(Comerciar) / 2)

    If PtsComercio <= 10 And PtsComercio > 5 Then
        UserList(Userindex).flags.Descuento = 1.1
        Descuento = 1.1
    ElseIf PtsComercio <= 20 And PtsComercio >= 11 Then
        UserList(Userindex).flags.Descuento = 1.2
        Descuento = 1.2
    ElseIf PtsComercio <= 30 And PtsComercio >= 19 Then
        UserList(Userindex).flags.Descuento = 1.3
        Descuento = 1.3
    ElseIf PtsComercio <= 40 And PtsComercio >= 29 Then
        UserList(Userindex).flags.Descuento = 1.4
        Descuento = 1.4
    ElseIf PtsComercio <= 50 And PtsComercio >= 39 Then
        UserList(Userindex).flags.Descuento = 1.5
        Descuento = 1.5
    ElseIf PtsComercio <= 60 And PtsComercio >= 49 Then
        UserList(Userindex).flags.Descuento = 1.6
        Descuento = 1.6
    ElseIf PtsComercio <= 70 And PtsComercio >= 59 Then
        UserList(Userindex).flags.Descuento = 1.7
        Descuento = 1.7
    ElseIf PtsComercio <= 80 And PtsComercio >= 69 Then
        UserList(Userindex).flags.Descuento = 1.8
        Descuento = 1.8
    ElseIf PtsComercio <= 99 And PtsComercio >= 79 Then
        UserList(Userindex).flags.Descuento = 1.9
        Descuento = 1.9
    ElseIf PtsComercio <= 999999 And PtsComercio >= 99 Then
        UserList(Userindex).flags.Descuento = 2
        Descuento = 2
    Else
        UserList(Userindex).flags.Descuento = 0
        Descuento = 0

    End If

    Exit Function
fallo:
    Call LogError("DESCUENTO" & Err.number & " D: " & Err.Description)

End Function

Sub EnviarNpcInv(ByVal Userindex As Integer, ByVal NpcIndex As Integer)

    On Error GoTo fallo

    'Enviamos el inventario del npc con el cual el user va a comerciar...
    Dim i     As Integer
    Dim infla As Long
    Dim Desc  As String
    Dim val   As Long
    Desc = Descuento(Userindex)

    If Desc = 0 Then Desc = 1    'evitamos dividir por 0!

    For i = 1 To MAX_INVENTORY_SLOTS

        If Npclist(NpcIndex).Invent.Object(i).ObjIndex > 0 Then
            'Calculamos el porc de inflacion del npc
            infla = (Npclist(NpcIndex).Inflacion * ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).Valor) / 100

            'pluto:2.17------------
            If MapInfo(UserList(Userindex).Pos.Map).Dueño = 1 And Criminal(Userindex) Then infla = infla * 10

            If MapInfo(UserList(Userindex).Pos.Map).Dueño = 2 And Not Criminal(Userindex) Then infla = infla * 10
            '----------------------

            '-----
            val = (ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).Valor + infla) / Desc

            'pluto:6.8-------------
            If EventoDia = 5 Then
                val = val - Porcentaje(val, 20)

            End If

            '-------------------------------
            If val < 1 Then val = 1
            'pluto:6.0A
            Call SendData2(ToIndex, Userindex, 0, 45, Npclist(NpcIndex).Invent.Object(i).ObjIndex & "," & Npclist(NpcIndex).Invent.Object(i).Amount & "," & val)
            'SendData2 ToIndex, UserIndex, 0, 45, _
            'ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).Name _
            ' & "," & Npclist(NpcIndex).Invent.Object(i).Amount & _
            '"," & val _
            ' & "," & ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).GrhIndex _
            ' & "," & Npclist(NpcIndex).Invent.Object(i).ObjIndex _
            ' & "," & ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).OBJType _
            ' & "," & ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).MaxHIT _
            ' & "," & ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).MinHIT _
            ' & "," & ObjData(Npclist(NpcIndex).Invent.Object(i).ObjIndex).MaxDef
        Else
            Call SendData2(ToIndex, Userindex, 0, 45, 0)

            ' SendData2 ToIndex, UserIndex, 0, 45, _
            '"Nada" _
            '& "," & 0 & _
            '"," & 0 _
            '& "," & 0 _
            '& "," & 0 _
            '& "," & 0 _
            '& "," & 0 _
            '& "," & 0 _
            ' & "," & 0 _
            ' & "," & 0 _
            ' & "," & 0 _
            ' & "," & 0 _
            ' & "," & 0 _
            ' & "," & 0 _
            ' & "," & 0 _
            ' & "," & 0
        End If

    Next

    Exit Sub
fallo:
    Call LogError("ENVIARNPCINV" & Err.number & " D: " & Err.Description)

End Sub
