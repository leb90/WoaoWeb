Attribute VB_Name = "Invusuario"
Option Explicit

Public Function TieneObjetosRobables(ByVal Userindex As Integer) As Boolean

'17/09/02
'Agregue que la función se asegure que el objeto no es un barco

    On Error GoTo fallo

    Dim i As Integer
    Dim ObjIndex As Integer

    For i = 1 To MAX_INVENTORY_SLOTS
        ObjIndex = UserList(Userindex).Invent.Object(i).ObjIndex

        If ObjIndex > 0 Then
            If ObjData(ObjIndex).OBJType <> OBJTYPE_LLAVES Then
                TieneObjetosRobables = True
                Exit Function

            End If

        End If

    Next i

    Exit Function
fallo:
    Call LogError("TIENEOBJETOSROBABLES" & Err.number & " D: " & Err.Description)

End Function

Public Function ObjetosConMana(ByVal Userindex As Integer) As Integer

    On Error GoTo fallo

    Dim i As Integer
    Dim ObjIndex As Integer

    For i = 1 To MAX_INVENTORY_SLOTS
        ObjIndex = UserList(Userindex).Invent.Object(i).ObjIndex

        If ObjIndex > 0 Then

            If UserList(Userindex).Invent.Object(i).Equipped > 0 Then

                If ObjData(ObjIndex).objetoespecial = 8 Then ObjetosConMana = ObjetosConMana + 100
                If ObjData(ObjIndex).objetoespecial = 9 Then ObjetosConMana = ObjetosConMana + 200
                If ObjData(ObjIndex).objetoespecial = 10 Then ObjetosConMana = ObjetosConMana + 300

                'pluto:7.0
                If ObjData(ObjIndex).objetoespecial = 17 Then ObjetosConMana = ObjetosConMana + 200
                If ObjData(ObjIndex).objetoespecial = 19 Then ObjetosConMana = ObjetosConMana + 55

            End If

        End If

    Next i

    Exit Function
fallo:
    Call LogError("OBjetosconMana" & Err.number & " D: " & Err.Description)

End Function

Sub CambiarGemas(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim dar As Integer
    Dim clase As String
    Dim raza As String
    Dim Genero As String

    'Dim alli As Byte
    clase = UCase$(UserList(Userindex).clase)
    raza = UCase$(UserList(Userindex).raza)
    Genero = UCase$(UserList(Userindex).Genero)

    If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

        'PLUTO:6.8 AÑADE CLASES PARA TUNICAS
        If clase = "MAGO" Or clase = "DRUIDA" Or clase = "BARDO" Then
            dar = 626
        Else
            dar = 592

        End If

    Else    'raza

        If clase = "MAGO" Or clase = "DRUIDA" Or clase = "BARDO" Then

            Select Case Genero

            Case "HOMBRE"
                dar = 619

            Case "MUJER"
                dar = 619
            End Select    'GENERO

        Else

            Select Case Genero

            Case "HOMBRE"
                dar = 590

            Case "MUJER"
                dar = 591
            End Select    'GENERO

        End If    'CLASE
    End If    'RAZA

    Dim MiObj As obj
    MiObj.Amount = 1
    MiObj.ObjIndex = dar

    If Not MeterItemEnInventario(Userindex, MiObj) Then
        Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

    End If

    Call SendData(ToIndex, Userindex, 0, "||6°Enhorabuena, te has ganado esta Armadura Dragón que no se cae.!!!°" & _
                                         str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

    Exit Sub
fallo:
    Call LogError("CAMBIARGEMAS" & Err.number & " D: " & Err.Description)

End Sub

Sub CambiarGriaL(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim dar As Integer
    Dim clase As String
    Dim raza As String
    Dim Genero As String

    'Dim alli As Byte
    clase = UCase$(UserList(Userindex).clase)
    raza = UCase$(UserList(Userindex).raza)
    Genero = UCase$(UserList(Userindex).Genero)

    If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

        Select Case Genero

        Case "HOMBRE"
            dar = 943

        Case "MUJER"
            dar = 944
        End Select    'GENERO

        'pluto:6.0A
        If clase = "MAGO" Or clase = "DRUIDA" Or clase = "BARDO" Then
            dar = 1217

        End If

    Else    'raza

        Select Case Genero

        Case "HOMBRE"
            dar = 941

        Case "MUJER"
            dar = 942
        End Select    'GENERO

        'pluto:6.0A
        If clase = "MAGO" Or clase = "DRUIDA" Or clase = "BARDO" Then
            dar = 1216

        End If

    End If    'RAZA

    Dim MiObj As obj
    MiObj.Amount = 1
    MiObj.ObjIndex = dar

    If Not MeterItemEnInventario(Userindex, MiObj) Then
        Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

    End If

    Call SendData(ToIndex, Userindex, 0, "||6°Enhorabuena, te has ganado esta Armadura Legendaria que no se cae.!!!°" _
                                         & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

    Exit Sub
fallo:
    Call LogError("CAMBIARLEGENDARIAS" & Err.number & " D: " & Err.Description)

End Sub

Sub CambiarBola(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim dar As Integer
    Dim clase As String
    Dim raza As String
    Dim Genero As String

    'Dim alli As Byte
    clase = UCase$(UserList(Userindex).clase)
    raza = UCase$(UserList(Userindex).raza)
    Genero = UCase$(UserList(Userindex).Genero)

    If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

        Select Case Genero

        Case "HOMBRE"
            dar = 1012

        Case "MUJER"
            dar = 1012
        End Select    'GENERO

        'pluto:6.0A
        If clase = "MAGO" Or clase = "DRUIDA" Or clase = "BARDO" Then
            dar = 1291

        End If

    Else    'raza

        Select Case Genero

        Case "HOMBRE"
            dar = 1011

        Case "MUJER"
            dar = 1011
        End Select    'GENERO

        'pluto:6.0A
        If clase = "MAGO" Or clase = "DRUIDA" Or clase = "BARDO" Then
            dar = 1292

        End If

    End If    'RAZA

    Dim MiObj As obj
    MiObj.Amount = 1
    MiObj.ObjIndex = dar

    If Not MeterItemEnInventario(Userindex, MiObj) Then
        Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

    End If

    Call SendData(ToIndex, Userindex, 0, _
                  "||6°Enhorabuena, te has ganado esta Armadura del Caballero de la Muerte que no se cae.!!!°" & str( _
                  Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

    Exit Sub
fallo:
    Call LogError("CAMBIARLEGENDARIAS" & Err.number & " D: " & Err.Description)

End Sub

Sub CambiarTrofeo(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).Stats.Puntos = UserList(Userindex).Stats.Puntos + 200

    Call SendData(ToIndex, Userindex, 0, "||6°Enhorabuena, te has ganado 200 puntos de Canje.!!!°" & str(Npclist( _
                                                                                                          UserList(Userindex).flags.TargetNpc).Char.CharIndex))
    Dim PuntosC As Integer
    PuntosC = UserList(Userindex).Stats.Puntos
    Call SendData(ToIndex, Userindex, 0, "J5" & PuntosC)

    Exit Sub
fallo:
    Call LogError("CAMBIARLEGENDARIAS" & Err.number & " D: " & Err.Description)

End Sub

Sub CambiarTrofeo2(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim dar As Integer
    Dim clase As String
    Dim raza As String
    Dim Genero As String

    'Dim alli As Byte
    clase = UCase$(UserList(Userindex).clase)
    raza = UCase$(UserList(Userindex).raza)
    Genero = UCase$(UserList(Userindex).Genero)

    If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

        Select Case Genero

        Case "HOMBRE"
            dar = 1245

        Case "MUJER"
            dar = 1245
        End Select    'GENERO

        'pluto:6.0A
        If clase = "MAGO" Or clase = "DRUIDA" Or clase = "BARDO" Then
            dar = 1245

        End If

    Else    'raza

        Select Case Genero

        Case "HOMBRE"
            dar = 1245

        Case "MUJER"
            dar = 1245
        End Select    'GENERO

        'pluto:6.0A
        If clase = "MAGO" Or clase = "DRUIDA" Or clase = "BARDO" Then
            dar = 1245

        End If

    End If    'RAZA

    Dim MiObj As obj
    MiObj.Amount = 1
    MiObj.ObjIndex = dar

    If Not MeterItemEnInventario(Userindex, MiObj) Then
        Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

    End If

    Call SendData(ToIndex, Userindex, 0, "||6°Enhorabuena, te has ganado 1 Trofeo de Primer puesto.!!!°" & str( _
                                         Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

    Exit Sub
fallo:
    Call LogError("CAMBIARLEGENDARIAS" & Err.number & " D: " & Err.Description)

End Sub

Function ClasePuedeUsarItem(ByVal Userindex As Integer, _
                            ByVal ObjIndex As Integer) As Boolean

    On Error GoTo manejador

    If UserList(Userindex).flags.Privilegios > 0 Then
        ClasePuedeUsarItem = True
        Exit Function

    End If

    'pluto:2.15
    If UserList(Userindex).Bebe > 0 And ObjIndex <> 460 Then
        ClasePuedeUsarItem = False
        Exit Function

    End If

    '----------

    Dim flag As Boolean

    If ObjData(ObjIndex).ClaseProhibida(1) <> "" Then

        Dim i As Integer

        For i = 1 To NUMCLASES

            If ObjData(ObjIndex).ClaseProhibida(i) = UCase$(UserList(Userindex).clase) Then
                ClasePuedeUsarItem = False
                Exit Function

            End If

        Next i

    Else

    End If

    ClasePuedeUsarItem = True
    Exit Function

manejador:
    LogError ("Error en ClasePuedeUsarItem")

End Function

Sub QuitarNewbieObj(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim J As Integer

    For J = 1 To MAX_INVENTORY_SLOTS

        If UserList(Userindex).Invent.Object(J).ObjIndex > 0 Then

            If ObjData(UserList(Userindex).Invent.Object(J).ObjIndex).Newbie = 1 Then Call QuitarUserInvItem( _
               Userindex, J, UserList(Userindex).Invent.Object(J).Amount)
            Call UpdateUserInv(False, Userindex, J)

        End If

    Next

    Exit Sub
fallo:
    Call LogError("QUITARNEWBIEOBJ" & Err.number & " D: " & Err.Description)

End Sub

Sub LimpiarInventario(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim J As Integer

    For J = 1 To MAX_INVENTORY_SLOTS
        UserList(Userindex).Invent.Object(J).ObjIndex = 0
        UserList(Userindex).Invent.Object(J).Amount = 0
        UserList(Userindex).Invent.Object(J).Equipped = 0

    Next

    UserList(Userindex).Invent.NroItems = 0

    UserList(Userindex).Invent.ArmourEqpObjIndex = 0
    UserList(Userindex).Invent.ArmourEqpSlot = 0

    UserList(Userindex).Invent.WeaponEqpObjIndex = 0
    UserList(Userindex).Invent.WeaponEqpSlot = 0

    UserList(Userindex).Invent.CascoEqpObjIndex = 0
    UserList(Userindex).Invent.CascoEqpSlot = 0

    '[GAU]
    UserList(Userindex).Invent.BotaEqpObjIndex = 0
    UserList(Userindex).Invent.BotaEqpSlot = 0
    '[GAU]

    UserList(Userindex).Invent.AlaEqpObjIndex = 0
    UserList(Userindex).Invent.AlaEqpSlot = 0

    'pluto:2.4
    UserList(Userindex).Invent.AnilloEqpObjIndex = 0
    UserList(Userindex).Invent.AnilloEqpSlot = 0

    UserList(Userindex).Invent.EscudoEqpObjIndex = 0
    UserList(Userindex).Invent.EscudoEqpSlot = 0

    UserList(Userindex).Invent.HerramientaEqpObjIndex = 0
    UserList(Userindex).Invent.HerramientaEqpSlot = 0

    UserList(Userindex).Invent.MunicionEqpObjIndex = 0
    UserList(Userindex).Invent.MunicionEqpSlot = 0

    UserList(Userindex).Invent.BarcoObjIndex = 0
    UserList(Userindex).Invent.BarcoSlot = 0
    Exit Sub
fallo:
    Call LogError("LIMPIARINVENTARIO" & Err.number & " D: " & Err.Description)

End Sub

Sub TirarOro(ByVal Cantidad As Long, ByVal Userindex As Integer)

    On Error GoTo fallo

    'PLUTO:6.2
    If UserList(Userindex).Pos.Map = 191 Or UserList(Userindex).Pos.Map = 293 Or UserList(Userindex).Pos.Map = 164 Or UserList(Userindex).Pos.Map = 203 Or UserList(Userindex).Pos.Map = 204 Or UserList(Userindex).Pos.Map = 205 Or UserList(Userindex).Pos.Map = 206 Or UserList(Userindex).Pos.Map = 207 Or UserList(Userindex).Pos.Map = 208 Or UserList(Userindex).Pos.Map = _
       MapaTorneo2 Then Exit Sub

    If Cantidad > 100000 Then Exit Sub
    If Cantidad < 10000 Then
    Call SendData(ToIndex, Userindex, 0, "||No puedes tirar menos de 10.000 de oro." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
    Exit Sub
    End If
    
    If UserList(Userindex).flags.Privilegios > 0 And UserList(Userindex).flags.Privilegios < 3 Then Exit Sub

    'SI EL NPC TIENE ORO LO TIRAMOS
    If (Cantidad > 0) And (Cantidad <= UserList(Userindex).Stats.GLD) Then
        Dim i As Byte
        Dim MiObj As obj
        'info debug
        Dim loops As Integer

        Do While (Cantidad > 0) And (UserList(Userindex).Stats.GLD > 0)

            If Cantidad > MAX_INVENTORY_OBJS And UserList(Userindex).Stats.GLD > MAX_INVENTORY_OBJS Then
                MiObj.Amount = MAX_INVENTORY_OBJS
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - MAX_INVENTORY_OBJS
                Cantidad = Cantidad - MiObj.Amount
            Else
                MiObj.Amount = Cantidad
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Cantidad
                Cantidad = Cantidad - MiObj.Amount

            End If

            MiObj.ObjIndex = iORO

            If UserList(Userindex).flags.Privilegios > 0 Then Call LogGM(UserList(Userindex).Name, "Tiro cantidad:" & _
                                                                                                   MiObj.Amount & " Objeto:" & ObjData(MiObj.ObjIndex).Name)

            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)
            Call LogCasino("Usuario tira oro: " & UserList(Userindex).Name & " IP: " & UserList(Userindex).ip & _
                           " Nom: " & " MAPA: " & UserList(Userindex).Pos.Map)
            'info debug
            loops = loops + 1

            If loops > 100 Then
                LogError ("Error en tiraroro")
                Exit Sub

            End If

        Loop

    End If

    Exit Sub

    Exit Sub
fallo:
    Call LogError("TIRARORO" & Err.number & " D: " & Err.Description)

End Sub

Sub QuitarUserInvItem(ByVal Userindex As Integer, _
                      ByVal Slot As Byte, _
                      ByVal Cantidad As Integer)

    On Error GoTo fallo

    Dim MiObj As obj

    'Desequipa
    If Slot < 1 Or Slot > MAX_INVENTORY_SLOTS Then Exit Sub
    If UserList(Userindex).Invent.Object(Slot).Equipped = 1 Then Call Desequipar(Userindex, Slot)

    'Quita un objeto
    UserList(Userindex).Invent.Object(Slot).Amount = UserList(Userindex).Invent.Object(Slot).Amount - Cantidad
    'pluto.2.3
    UserList(Userindex).Stats.Peso = UserList(Userindex).Stats.Peso - (ObjData(UserList(Userindex).Invent.Object( _
                                                                               Slot).ObjIndex).Peso * Cantidad)

    'pluto:2.4.5
    If UserList(Userindex).Stats.Peso < 0.001 Then UserList(Userindex).Stats.Peso = 0
    Call SendUserStatsPeso(Userindex)

    '¿Quedan mas?
    If UserList(Userindex).Invent.Object(Slot).Amount <= 0 Then
        UserList(Userindex).Invent.NroItems = UserList(Userindex).Invent.NroItems - 1
        UserList(Userindex).Invent.Object(Slot).ObjIndex = 0
        UserList(Userindex).Invent.Object(Slot).Amount = 0

    End If

    Exit Sub
fallo:
    Call LogError("QUITARUSERINVENTARIO " & Err.number & " D: " & Err.Description)

End Sub

Sub UpdateUserInv(ByVal UpdateAll As Boolean, _
                  ByVal Userindex As Integer, _
                  ByVal Slot As Byte)

    On Error GoTo fallo

    Dim NullObj As UserOBJ
    Dim loopc As Byte

    'Actualiza un solo slot
    If Not UpdateAll Then

        'Actualiza el inventario
        If UserList(Userindex).Invent.Object(Slot).ObjIndex > 0 Then
            Call ChangeUserInv(Userindex, Slot, UserList(Userindex).Invent.Object(Slot))
        Else
            Call ChangeUserInv(Userindex, Slot, NullObj)

        End If

    Else

        'Actualiza todos los slots
        For loopc = 1 To MAX_INVENTORY_SLOTS

            'Actualiza el inventario
            If UserList(Userindex).Invent.Object(loopc).ObjIndex > 0 Then
                Call ChangeUserInv(Userindex, loopc, UserList(Userindex).Invent.Object(loopc))
            Else

                Call ChangeUserInv(Userindex, loopc, NullObj)

            End If

        Next loopc

    End If

    Exit Sub
fallo:
    Call LogError("UPDATEUSERINV" & Err.number & " D: " & Err.Description)

End Sub

Sub DropObj(ByVal Userindex As Integer, _
            ByVal Slot As Byte, _
            ByVal num As Integer, _
            ByVal Map As Integer, _
            ByVal X As Integer, _
            ByVal Y As Integer)

    On Error GoTo fallo

    If UserList(Userindex).flags.Privilegios > 0 Then GoTo sipuede

    'PLUTO:6.2
    If UserList(Userindex).Pos.Map = 191 Or UserList(Userindex).Pos.Map = 293 Or UserList(Userindex).Pos.Map = 164 Or UserList(Userindex).Pos.Map = 203 Or UserList(Userindex).Pos.Map = 204 Or UserList(Userindex).Pos.Map = 205 Or UserList(Userindex).Pos.Map = 206 Or UserList(Userindex).Pos.Map = 207 Or UserList(Userindex).Pos.Map = 208 Or UserList(Userindex).Pos.Map = _
       MapaTorneo2 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes soltar Objetos en este Mapa." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    Dim obj As obj

    'pluto:2.17
    If (ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).Real = 1 Or ObjData(UserList( _
                                                                                      Userindex).Invent.Object(Slot).ObjIndex).Caos = 1) And UserList(Userindex).Pos.Map <> 49 And UserList( _
                                                                                      Userindex).Invent.Object(Slot).ObjIndex <> 1018 And UserList(Userindex).Invent.Object(Slot).ObjIndex <> _
                                                                                      1019 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes soltar la Ropa de Armadas" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'pluto:6.7------------------------
    If UserList(Userindex).Invent.Object(Slot).ObjIndex = 1236 Or UserList(Userindex).Invent.Object(Slot).ObjIndex = _
       1238 Or UserList(Userindex).Invent.Object(Slot).ObjIndex = 1285 Or UserList(Userindex).Invent.Object( _
       Slot).ObjIndex = 1286 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes soltar la Perseus" & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    '--------------------------------
sipuede:

    'pluto:2.14
    If ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).OBJType = 42 And UserList(Userindex).flags.Montura > _
       0 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes soltar la Ropa mientrás Cabalgas." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If num > 0 Then

        If num > UserList(Userindex).Invent.Object(Slot).Amount Then num = UserList(Userindex).Invent.Object( _
           Slot).Amount

        'Check objeto en el suelo

        If UserList(Userindex).Invent.Object(Slot).Equipped = 1 Then

            If UserList(Userindex).flags.Morph > 0 Or UserList(Userindex).flags.Angel > 0 Or UserList( _
               Userindex).flags.Demonio > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes desequipar estando transformado." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            Call Desequipar(Userindex, Slot)

        End If

        obj.ObjIndex = UserList(Userindex).Invent.Object(Slot).ObjIndex
        obj.Amount = num

        If MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex = 0 Then

            'If UserList(UserIndex).Flags.Privilegios > 0 And UserList(UserIndex).Flags.Privilegios < 3 Then
            'If ObjData(Obj.ObjIndex).Real = 0 And ObjData(Obj.ObjIndex).Caos = 0 _
             'And ObjData(Obj.ObjIndex).nocaer = 0 Or ObjData(Obj.ObjIndex).ObjType = 40 Then Exit Sub
            ' End If
            'pluto:2.9.0
            If ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).OBJType <> 60 Then
                Call MakeObj(ToMap, 0, Map, obj, Map, X, Y)

                If UserList(Userindex).flags.Muerto = 0 Then UserList(Userindex).ObjetosTirados = UserList( _
                   Userindex).ObjetosTirados + 1

                If Alarma = 1 Then Call SendData(ToAdmins, Userindex, 0, "||Tira Objeto: " & UserList(Userindex).Name _
                                                                         & " " & ObjData(obj.ObjIndex).Name & "´" & FontTypeNames.FONTTYPE_COMERCIO)

            End If

            If ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).OBJType = 60 And UserList( _
               Userindex).flags.Montura > 0 Then Exit Sub

            If ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).OBJType = 60 Then
                Dim xx As Integer
                xx = obj.ObjIndex - 887

            End If

            Call QuitarUserInvItem(Userindex, Slot, num)
            Call UpdateUserInv(False, Userindex, Slot)

            If UserList(Userindex).flags.Privilegios > 0 Then Call LogGM(UserList(Userindex).Name, "Tiro cantidad:" & _
                                                                                                   num & " Objeto:" & ObjData(obj.ObjIndex).Name)
        Else

            'pluto:2.6.0
            If ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).OBJType = 60 Then Exit Sub

            'pluto:6.0A
            If ObjData(MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex).OBJType = 6 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes soltar objetos en una puerta." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            Call SendData(ToIndex, Userindex, 0, "M8")
            Call TirarItemAlPiso(UserList(Userindex).Pos, obj)
            Call QuitarUserInvItem(Userindex, Slot, num)
            Call UpdateUserInv(False, Userindex, Slot)

            If UserList(Userindex).flags.Privilegios > 0 Then Call LogGM(UserList(Userindex).Name, "Tiro cantidad:" & _
                                                                                                   num & " Objeto:" & ObjData(obj.ObjIndex).Name)

            'pluto:2.9.0
            If UserList(Userindex).flags.Muerto = 0 Then UserList(Userindex).ObjetosTirados = UserList( _
               Userindex).ObjetosTirados + 1

            If Alarma = 1 Then Call SendData(ToAdmins, Userindex, 0, "||Tira Objeto: " & UserList(Userindex).Name & _
                                                                     " " & ObjData(obj.ObjIndex).Name & "´" & FontTypeNames.FONTTYPE_COMERCIO)

        End If

    End If

    Exit Sub
fallo:
    Call LogError("DROPOBJETO " & Err.number & " D: " & Err.Description)

End Sub

Sub EraseObj(ByVal sndRoute As Byte, _
             ByVal sndIndex As Integer, _
             ByVal sndMap As Integer, _
             ByVal num As Integer, _
             ByVal Map As Integer, _
             ByVal X As Integer, _
             ByVal Y As Integer)

    On Error GoTo fallo

    MapData(Map, X, Y).OBJInfo.Amount = MapData(Map, X, Y).OBJInfo.Amount - num

    If MapData(Map, X, Y).OBJInfo.Amount <= 0 Then
        MapData(Map, X, Y).OBJInfo.ObjIndex = 0
        MapData(Map, X, Y).OBJInfo.Amount = 0
        'pluto:2.3----------
        'If sndRoute = 2 Then
        'Call SendToAreaByPos(Map, X, Y, "BO" & X & "," & Y)
        'Else
        Call SendData(sndRoute, sndIndex, sndMap, "BO" & X & "," & Y)
        'End If
        '--------------------

    End If

    Exit Sub
fallo:
    Call LogError("ERASE OBJETO " & Err.number & " D: " & Err.Description)

End Sub

Sub MakeObj(ByVal sndRoute As Byte, _
            ByVal sndIndex As Integer, _
            ByVal sndMap As Integer, _
            obj As obj, _
            Map As Integer, _
            ByVal X As Integer, _
            ByVal Y As Integer)

    On Error GoTo fallo

    'Crea un Objeto
    If obj.ObjIndex = 0 Then Exit Sub

    'pluto:2.15
    If ObjData(obj.ObjIndex).OBJType = 77 Then
        Dim roda As Byte
        roda = RandomNumber(1, 6)
        Call SendData(sndRoute, sndIndex, sndMap, "HU" & ObjData(obj.ObjIndex).GrhIndex & "," & X & "," & Y & "," & _
                                                  roda)
        Exit Sub

    End If

    '------------------------
    MapData(Map, X, Y).OBJInfo = obj
    Call SendData(sndRoute, sndIndex, sndMap, "HO" & ObjData(obj.ObjIndex).GrhIndex & "," & X & "," & Y)
    Exit Sub
fallo:
    Call LogError("MAKEOBJ " & Err.number & " D: " & Err.Description)

End Sub

Function MeterItemEnInventario(ByVal Userindex As Integer, ByRef MiObj As obj) As Boolean

    On Error GoTo fallo

    'Call LogTarea("MeterItemEnInventario")

    Dim X As Integer
    Dim Y As Integer
    Dim Slot As Byte

    '¿el user ya tiene un objeto del mismo tipo?
    Slot = 1

    Do Until UserList(Userindex).Invent.Object(Slot).ObjIndex = MiObj.ObjIndex And UserList(Userindex).Invent.Object( _
       Slot).Amount + MiObj.Amount <= MAX_INVENTORY_OBJS
        Slot = Slot + 1

        If Slot > MAX_INVENTORY_SLOTS Then
            Exit Do

        End If

    Loop

    'Sino busca un slot vacio
    If Slot > MAX_INVENTORY_SLOTS Then
        Slot = 1

        Do Until UserList(Userindex).Invent.Object(Slot).ObjIndex = 0
            Slot = Slot + 1

            If Slot > MAX_INVENTORY_SLOTS Then
                '           Call SendData(ToIndex, UserIndex, 0, "||No podes cargar mas objetos." & FONTTYPENAMES.FONTTYPE_fight)
                MeterItemEnInventario = False
                Exit Function

            End If

        Loop
        UserList(Userindex).Invent.NroItems = UserList(Userindex).Invent.NroItems + 1

    End If

    'Mete el objeto
    If UserList(Userindex).Invent.Object(Slot).Amount + MiObj.Amount <= MAX_INVENTORY_OBJS Then
        'Menor que MAX_INV_OBJS
        UserList(Userindex).Invent.Object(Slot).ObjIndex = MiObj.ObjIndex
        UserList(Userindex).Invent.Object(Slot).Amount = UserList(Userindex).Invent.Object(Slot).Amount + MiObj.Amount
    Else
        UserList(Userindex).Invent.Object(Slot).Amount = MAX_INVENTORY_OBJS

    End If

    MeterItemEnInventario = True

    'pluto.2.3
    UserList(Userindex).Stats.Peso = UserList(Userindex).Stats.Peso + (ObjData(UserList(Userindex).Invent.Object( _
                                                                               Slot).ObjIndex).Peso * MiObj.Amount)
    Call SendUserStatsPeso(Userindex)

    Call UpdateUserInv(False, Userindex, Slot)
    'Debug.Print UserList(UserIndex).Invent.Object(11).Amount
    Exit Function
fallo:
    Call LogError("METERITEMINVENTARIO " & UserList(Userindex).Name & " Obj: " & MiObj.ObjIndex & " C: " & _
                  MiObj.Amount & " " & Err.number & " D: " & Err.Description)

End Function

Sub GetObj(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim obj As ObjData
    Dim MiObj As obj

    'IRON AO: No puedes agarrar items invisible
    'If UserList(UserIndex).flags.Invisible = 1 Then
    'Call SendData(ToIndex, 0, 0, "||¡No puedes tomar un objeto estando invisible!." & "´" & FontTypeNames.FONTTYPE_info)
    'Exit Sub
    'End If
    '¿Hay algun obj?
    If MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y).OBJInfo.ObjIndex > _
       0 Then
        UserList(Userindex).ObjetosTirados = 0

        '¿Esta permitido agarrar este obj?
        If ObjData(MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList( _
                                                                                   Userindex).Pos.Y).OBJInfo.ObjIndex).Agarrable <> 1 Then
            Dim X As Integer
            Dim Y As Integer
            Dim Slot As Byte

            X = UserList(Userindex).Pos.X
            Y = UserList(Userindex).Pos.Y
            obj = ObjData(MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList( _
                                                                                          Userindex).Pos.Y).OBJInfo.ObjIndex)
            MiObj.Amount = MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.Amount
            MiObj.ObjIndex = MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex

            'pluto:2.4.5
            If (ObjData(MiObj.ObjIndex).Peso * MiObj.Amount) + UserList(Userindex).Stats.Peso > UserList( _
               Userindex).Stats.PesoMax Then
                Dim pd, vc As Integer
                pd = UserList(Userindex).Stats.PesoMax - UserList(Userindex).Stats.Peso
                'pluto:6.5

                If pd < 0 Then GoTo lala

                vc = Int(pd / ObjData(MiObj.ObjIndex).Peso)
lala:
                Call SendData(ToIndex, Userindex, 0, "||Demasiada Carga." & "´" & FontTypeNames.FONTTYPE_INFO)

                If vc < 1 Then Exit Sub
                MiObj.Amount = vc
            Else
                vc = MiObj.Amount

            End If

            If Not MeterItemEnInventario(Userindex, MiObj) Then
                Call SendData(ToIndex, Userindex, 0, "P5")
            Else
                'Quitamos el objeto

                Call EraseObj(ToMap, 0, UserList(Userindex).Pos.Map, vc, UserList(Userindex).Pos.Map, UserList( _
                                                                                                      Userindex).Pos.X, UserList(Userindex).Pos.Y)

                If UserList(Userindex).flags.Privilegios > 0 Then Call LogGM(UserList(Userindex).Name, "Agarro:" & vc _
                                                                                                       & " Objeto:" & ObjData(MiObj.ObjIndex).Name)

            End If

        End If

    Else
        Call SendData(ToIndex, Userindex, 0, "M9")

    End If

    Exit Sub
fallo:
    Call LogError("GETOBJ " & Err.number & " D: " & Err.Description & "->" & UserList(Userindex).Name & " Obj:" & _
                  MiObj.ObjIndex & " Cant:" & MiObj.Amount)

End Sub

Sub GetObjFantasma(ByVal Userindex As Integer, ByVal X As Byte, ByVal Y As Byte)

    On Error GoTo fallo

    Dim obj As ObjData
    Dim MiObj As obj

    '¿Hay algun obj?
    If MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex > 0 Then
        UserList(Userindex).ObjetosTirados = 0

        '¿Esta permitido agarrar este obj?
        If ObjData(MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex).Agarrable <> 1 Then

            Dim Slot As Byte

            obj = ObjData(MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex)
            MiObj.Amount = MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.Amount
            MiObj.ObjIndex = MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex

            'pluto:2.4.5
            If (ObjData(MiObj.ObjIndex).Peso * MiObj.Amount) + UserList(Userindex).Stats.Peso > UserList( _
               Userindex).Stats.PesoMax Then
                Dim pd, vc As Integer
                pd = UserList(Userindex).Stats.PesoMax - UserList(Userindex).Stats.Peso
                vc = Int(pd / ObjData(MiObj.ObjIndex).Peso)
                Call SendData(ToIndex, Userindex, 0, "||Demasiada Carga." & "´" & FontTypeNames.FONTTYPE_INFO)

                If vc < 1 Then Exit Sub
                MiObj.Amount = vc
            Else
                vc = MiObj.Amount

            End If

            If Not MeterItemEnInventario(Userindex, MiObj) Then
                Call SendData(ToIndex, Userindex, 0, "P5")
            Else
                'Quitamos el objeto

                Call EraseObj(ToMap, 0, UserList(Userindex).Pos.Map, vc, UserList(Userindex).Pos.Map, X, Y)

                If UserList(Userindex).flags.Privilegios > 0 Then Call LogGM(UserList(Userindex).Name, "Agarro:" & vc _
                                                                                                       & " Objeto:" & ObjData(MiObj.ObjIndex).Name)

            End If

        End If

    Else
        Call SendData(ToIndex, Userindex, 0, "M9")

    End If

    Exit Sub
fallo:
    Call LogError("GETOBJ " & Err.number & " D: " & Err.Description & "->" & UserList(Userindex).Name & " Obj:" & _
                  MiObj.ObjIndex & " Cant:" & MiObj.Amount)

End Sub

Sub Desequipar(ByVal Userindex As Integer, ByVal Slot As Byte)

    On Error GoTo fallo

    With UserList(Userindex)

        'PLUTO:2.4.2
        If .Pos.Map = 191 Then Exit Sub

        'Desequipa el item slot del inventario
        Dim obj As ObjData

        If .flags.Morph > 0 Or .flags.Angel > 0 Or .flags.Demonio > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes desequipar estando transformado." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If Slot = 0 Then Exit Sub

        If .Invent.Object(Slot).ObjIndex = 0 Then Exit Sub
        obj = ObjData(.Invent.Object(Slot).ObjIndex)

        Select Case obj.OBJType

            Case OBJTYPE_WEAPON

                'objeto especial
                If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 2 Then
                    .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 5

                End If

                If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 3 Then
                    .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 2

                End If

                If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 4 Then
                    .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 3

                End If

                If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 8 Then
                    .Stats.MaxMAN = .Stats.MaxMAN - 100

                End If

                If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 9 Then
                    .Stats.MaxMAN = .Stats.MaxMAN - 200

                End If

                If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 10 Then
                    .Stats.MaxMAN = .Stats.MaxMAN - 300

                End If

                .Invent.Object(Slot).Equipped = 0
                .Invent.WeaponEqpObjIndex = 0
                .Invent.WeaponEqpSlot = 0
                .Char.WeaponAnim = NingunArma
                '[GAU] Agregamo .Char.Botas
                Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

            Case OBJTYPE_FLECHAS

                .Invent.Object(Slot).Equipped = 0
                .Invent.MunicionEqpObjIndex = 0
                .Invent.MunicionEqpSlot = 0

            Case OBJTYPE_HERRAMIENTAS

                .Invent.Object(Slot).Equipped = 0
                .Invent.HerramientaEqpObjIndex = 0
                .Invent.HerramientaEqpSlot = 0

                'pluto:2.4
            Case OBJTYPE_Anillo

                If ObjData(.Invent.AnilloEqpObjIndex).SubTipo = 1 Then
                    Call SendData(ToIndex, Userindex, 0, "E3")
                    .flags.Oculto = 0
                    .Counters.Invisibilidad = 0
                    .flags.Invisible = 0
                    Call SendData2(ToMap, 0, .Pos.Map, 16, .Char.CharIndex & ",0")

                End If

                'pluto:2.4
                If ObjData(.Invent.AnilloEqpObjIndex).SubTipo = 5 Then
                    .Stats.PesoMax = .Stats.PesoMax - 500
                    Call SendUserStatsPeso(Userindex)

                End If

                .Invent.Object(Slot).Equipped = 0
                .Invent.AnilloEqpObjIndex = 0
                .Invent.AnilloEqpSlot = 0

            Case OBJTYPE_ARMOUR

                Select Case obj.SubTipo

                    Case OBJTYPE_ARMADURA

                        Select Case ObjData(.Invent.ArmourEqpObjIndex).objetoespecial

                            Case 2
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 5

                            Case 3
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 2

                            Case 4
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 3

                            Case 5
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 5

                            Case 6
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 2

                            Case 7
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 3

                            Case 8
                                .Stats.MaxMAN = .Stats.MaxMAN - 100

                            Case 9
                                .Stats.MaxMAN = .Stats.MaxMAN - 200

                            Case 10
                                .Stats.MaxMAN = .Stats.MaxMAN - 300

                                'pluto:6.5----------
                            Case 14
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 5
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 2

                                '------------------
                                'pluto:7.0--------------------
                            Case 16
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 1
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 1

                            Case 17
                                .Stats.MaxMAN = .Stats.MaxMAN - 200
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 2

                            Case 18
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 1

                            Case 19
                                .Stats.MaxMAN = .Stats.MaxMAN - 55

                                '-------------------------------------
                        End Select

                        .Invent.Object(Slot).Equipped = 0
                        .Invent.ArmourEqpObjIndex = 0
                        .Invent.ArmourEqpSlot = 0

                        If .flags.Montura <> 1 Then Call DarCuerpoDesnudo(Userindex)
                        '[GAU] Agregamo .Char.Botas
                        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                    Case OBJTYPE_CASCO

                        'objeto especial
                        Select Case ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial

                            Case 5
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 5

                            Case 6
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 2

                            Case 7
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 3

                            Case 8
                                .Stats.MaxMAN = .Stats.MaxMAN - 100

                            Case 9
                                .Stats.MaxMAN = .Stats.MaxMAN - 200

                            Case 10
                                .Stats.MaxMAN = .Stats.MaxMAN - 300

                            Case 18
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 1

                        End Select

                        .Invent.Object(Slot).Equipped = 0
                        .Invent.CascoEqpObjIndex = 0
                        .Invent.CascoEqpSlot = 0
                        .Char.CascoAnim = NingunCasco
                        '[GAU] Agregamo .Char.Botas
                        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                        '[GAU] AGREGAR TODO ESTO!!!
                    Case OBJTYPE_BOTA
                        .Invent.Object(Slot).Equipped = 0
                        .Invent.BotaEqpObjIndex = 0
                        .Invent.BotaEqpSlot = 0
                        .Char.Botas = NingunBota
                        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                    Case OBJTYPE_ALAS
                        .Invent.Object(Slot).Equipped = 0
                        .Invent.AlaEqpObjIndex = 0
                        .Invent.AlaEqpSlot = 0
                        .Char.AlasAnim = NingunAla
                        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                        '[GAU] HASTA AK
                    Case OBJTYPE_ESCUDO

                        'objeto especial
                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 5 Then
                            .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 5

                        End If

                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 6 Then
                            .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 2

                        End If

                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 7 Then
                            .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 3

                        End If

                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 2 Then
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 5

                        End If

                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 3 Then
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 2

                        End If

                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 4 Then
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 3

                        End If

                        'pluto:6.5
                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 12 Then
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 1
                            .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 3

                        End If

                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 13 Then
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 2
                            .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 2

                        End If

                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 14 Then
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 5
                            .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 2

                        End If

                        If ObjData(.Invent.Object(Slot).ObjIndex).objetoespecial = 15 Then
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) - 3
                            .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) - 2

                        End If

                        '-----------------

                        .Invent.Object(Slot).Equipped = 0
                        .Invent.EscudoEqpObjIndex = 0
                        .Invent.EscudoEqpSlot = 0
                        .Char.ShieldAnim = NingunEscudo
                        '[GAU] Agregamo .Char.Botas
                        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                End Select

        End Select

        If .Stats.MinMAN > .Stats.MaxMAN Then .Stats.MinMAN = .Stats.MaxMAN
        'pluto:evita quitar dope arqueros
        'if obj.OBJType = OBJTYPE_FLECHAS And (UCase$(.clase) = "ARQUERO" Or UCase$(.clase) = "CAZADOR") Then GoTo alli9
        'anula efecto pociones

        'pluto:6.5 objetos que modifican atributos anulamos efecto pociones
        If obj.objetoespecial > 1 Then
            Dim loopX As Integer

            For loopX = 1 To NUMATRIBUTOS
                .Stats.UserAtributos(loopX) = .Stats.UserAtributosBackUP(loopX)
            Next

        End If

    End With

alli9:
    Call SendUserStatsMana(Userindex)
    Call UpdateUserInv(False, Userindex, Slot)
    Exit Sub
fallo:
    Call LogError("DESEQUIPAR " & Err.number & " D: " & Err.Description & " Nombre: " & UserList(Userindex).Name & " Obj: " & obj.Name & " Slot: " & Slot)

End Sub

Function SexoPuedeUsarItem(ByVal Userindex As Integer, _
                           ByVal ObjIndex As Integer) As Boolean

    On Error GoTo errhandler

    If UserList(Userindex).flags.Privilegios > 0 Then
        SexoPuedeUsarItem = True
        Exit Function

    End If

    If ObjData(ObjIndex).Mujer = 1 Then
        SexoPuedeUsarItem = UCase$(UserList(Userindex).Genero) <> "HOMBRE"
    ElseIf ObjData(ObjIndex).Hombre = 1 Then
        SexoPuedeUsarItem = UCase$(UserList(Userindex).Genero) <> "MUJER"
    Else
        SexoPuedeUsarItem = True

    End If

    Exit Function
errhandler:
    Call LogError("SexoPuedeUsarItem")

End Function

Function SkillsPuedeUsarItem(ByVal Userindex As Integer, _
                             ByVal ObjIndex As Integer) As Boolean

    On Error GoTo fallo

    SkillsPuedeUsarItem = False

    If UserList(Userindex).flags.Privilegios > 0 Then
        SkillsPuedeUsarItem = True
        Exit Function

    End If

    If ObjData(ObjIndex).proyectil > 0 And UserList(Userindex).Stats.UserSkills(RequeProyec) >= ObjData( _
       ObjIndex).SkArco Then SkillsPuedeUsarItem = True

    If ObjData(ObjIndex).proyectil = 0 And UserList(Userindex).Stats.UserSkills(RequeArma) >= ObjData( _
       ObjIndex).SkArma Then SkillsPuedeUsarItem = True

    Exit Function
fallo:
    Call LogError("skillspuedeusaritem" & Err.number & " D: " & Err.Description)

End Function

Function FaccionPuedeUsarItem(ByVal Userindex As Integer, _
                              ByVal ObjIndex As Integer) As Boolean

    On Error GoTo fallo

    If UserList(Userindex).flags.Privilegios > 0 Then
        FaccionPuedeUsarItem = True
        Exit Function

    End If

    If ObjData(ObjIndex).Real > 0 Then
        If UserList(Userindex).Faccion.ArmadaReal = 0 Then
            FaccionPuedeUsarItem = False
        Else
            FaccionPuedeUsarItem = True

        End If

    ElseIf ObjData(ObjIndex).Caos > 0 Then

        If UserList(Userindex).Faccion.FuerzasCaos = 0 Then
            FaccionPuedeUsarItem = False
        Else
            FaccionPuedeUsarItem = True

        End If

    Else
        FaccionPuedeUsarItem = True

    End If

    Exit Function
fallo:
    Call LogError("FACCIONPUEDEUSARITEM" & Err.number & " D: " & Err.Description)

End Function

Sub EquiparInvItem(ByVal Userindex As Integer, ByVal Slot As Byte)

    On Error GoTo errhandler

    With UserList(Userindex)

        'PLUTO:2.4.2
        If .Pos.Map = 191 Then Exit Sub

        If .flags.Morph > 0 Or .flags.Angel > 0 Or .flags.Demonio > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes equipar estando transformado." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'Equipa un item del inventario
        Dim obj      As ObjData
        Dim ObjIndex As Integer

        ObjIndex = .Invent.Object(Slot).ObjIndex
        obj = ObjData(ObjIndex)

        If .flags.Privilegios > 0 Then
            GoTo sipuede

        End If

        If obj.Newbie = 1 And Not EsNewbie(Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Solo los newbies pueden usar este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'pluto:2.10
        If obj.ObjetoClan <> "" Then
            If UCase$(.GuildInfo.GuildName) <> UCase$(obj.ObjetoClan) Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes equipar Ropa de ese Clan" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            End If

        End If

        'comprueba si es elfo
        If obj.razaelfa = 1 And .raza <> "Elfo" And .raza <> "Elfo Oscuro" Then
            Call SendData(ToIndex, Userindex, 0, "||Solo los Elfos pueden usar este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'comprueba si es vampiro
        If obj.razavampiro = 1 And .raza <> "Vampiro" Then
            Call SendData(ToIndex, Userindex, 0, "||Solo los Vampiros pueden usar este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'comprueba si es humano
        If obj.razahumana = 1 And .raza <> "Humano" Then
            Call SendData(ToIndex, Userindex, 0, "||Solo los Humanos pueden usar este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'comprueba si es orco
        If obj.razaorca = 1 And .raza <> "Orco" Then
            Call SendData(ToIndex, Userindex, 0, "||Solo los Orcos pueden usar este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'comprueba si es enano
        'pluto:7.0 añado goblin
        If obj.RazaEnana = 1 And .raza <> "Enano" And .raza <> "Gnomo" And .raza <> "Goblin" Then
            Call SendData(ToIndex, Userindex, 0, "||Solo los Enanos y Gnomos pueden usar este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If obj.Caos > 1 And .Faccion.FuerzasCaos = 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Sólo miembros de las Fuerzas del Caos pueden usar este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If obj.Real > 0 And .Faccion.ArmadaReal <> 1 Then
            Call SendData(ToIndex, Userindex, 0, "||Sólo los miembros de la Armada Real pueden usar este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

sipuede:

        'pluto:2.17-------------------
        If .Invent.EscudoEqpObjIndex = 0 Then GoTo n

        'If ObjData(.Invent.EscudoEqpObjIndex).SubTipo = 6 Or ObjData(.Invent.EscudoEqpObjIndex).SubTipo = 7 Then
        If (obj.SubTipo = 6 Or obj.SubTipo = 7) And ObjData(.Invent.EscudoEqpObjIndex).SubTipo = 2 And ObjData(.Invent.EscudoEqpObjIndex).OBJType = 3 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes usar Armas de dos Manos con Escudo." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

n:

        If .Invent.WeaponEqpObjIndex = 0 Then GoTo n1

        If obj.SubTipo = 2 And obj.OBJType = 3 And (ObjData(.Invent.WeaponEqpObjIndex).SubTipo = 6 Or ObjData(.Invent.WeaponEqpObjIndex).SubTipo = 7) Then
            'If ObjData(.Invent.WeaponEqpObjIndex).SubTipo = 6 Or ObjData(.Invent.WeaponEqpObjIndex).SubTipo = 7 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes usar Escudo con Armas de dos Manos." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'End If
n1:

        '-----------------------------------------------
        Select Case obj.OBJType

            Case OBJTYPE_WEAPON

                If ClasePuedeUsarItem(Userindex, ObjIndex) And FaccionPuedeUsarItem(Userindex, ObjIndex) And SkillsPuedeUsarItem(Userindex, ObjIndex) Then

                    'Si esta equipado lo quITA
                    If .Invent.Object(Slot).Equipped Then
                        'Quitamos del inv el item
                        Call Desequipar(Userindex, Slot)
                        'Animacion por defecto
                        .Char.WeaponAnim = NingunArma
                        '[GAU] Agregamo .Char.Botas
                        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                        Exit Sub

                    End If

                    'Quitamos el elemento anterior
                    If .Invent.WeaponEqpObjIndex > 0 Then
                        Call Desequipar(Userindex, .Invent.WeaponEqpSlot)

                    End If

                    .Invent.Object(Slot).Equipped = 1
                    .Invent.WeaponEqpObjIndex = .Invent.Object(Slot).ObjIndex
                    .Invent.WeaponEqpSlot = Slot
                    'añade objeto especial

                    Select Case ObjData(.Invent.WeaponEqpObjIndex).objetoespecial

                        Case 2
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 5

                        Case 3
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 2

                        Case 4
                            .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 3

                        Case 8
                            .Stats.MaxMAN = .Stats.MaxMAN + 100
                            Call SendUserStatsMana(Userindex)

                        Case 9
                            .Stats.MaxMAN = .Stats.MaxMAN + 200
                            Call SendUserStatsMana(Userindex)

                        Case 10
                            .Stats.MaxMAN = .Stats.MaxMAN + 300
                            Call SendUserStatsMana(Userindex)

                    End Select

                    'Sonido
                    Call SendData(ToPCArea, Userindex, .Pos.Map, "TW" & SOUND_SACARARMA)

                    .Char.WeaponAnim = obj.WeaponAnim

                    '[GAU] Agregamo .Char.Botas
                    Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                Else
                    Call SendData(ToIndex, Userindex, 0, "J4")

                    'Call SendData(ToIndex, UserIndex, 0, "||No puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                End If

            Case OBJTYPE_HERRAMIENTAS

                If ClasePuedeUsarItem(Userindex, ObjIndex) And FaccionPuedeUsarItem(Userindex, ObjIndex) And SkillsPuedeUsarItem(Userindex, ObjIndex) Then

                    'Si esta equipado lo quita
                    If .Invent.Object(Slot).Equipped Then
                        'Quitamos del inv el item
                        Call Desequipar(Userindex, Slot)
                        Exit Sub

                    End If

                    'Quitamos el elemento anterior
                    If .Invent.HerramientaEqpObjIndex > 0 Then
                        Call Desequipar(Userindex, .Invent.HerramientaEqpSlot)

                    End If

                    .Invent.Object(Slot).Equipped = 1
                    .Invent.HerramientaEqpObjIndex = ObjIndex
                    .Invent.HerramientaEqpSlot = Slot

                Else
                    'Call SendData(ToIndex, UserIndex, 0, "||Tu clase no puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                    Call SendData(ToIndex, Userindex, 0, "J4")

                End If

                'pluto:2.4
            Case OBJTYPE_Anillo
    
                If .Pos.Map = 182 Or .Pos.Map = 92 Or .Pos.Map = 279 Then Exit Sub

                If ClasePuedeUsarItem(Userindex, ObjIndex) And FaccionPuedeUsarItem(Userindex, ObjIndex) And SkillsPuedeUsarItem(Userindex, ObjIndex) Then

                    'Si esta equipado lo quita
                    If .Invent.Object(Slot).Equipped Then
                        'Quitamos del inv el item
                        Call Desequipar(Userindex, Slot)
                        Exit Sub

                    End If

                    'Quitamos el elemento anterior
                    If .Invent.AnilloEqpObjIndex > 0 Then
                        Call Desequipar(Userindex, .Invent.AnilloEqpSlot)

                    End If

                    .Invent.Object(Slot).Equipped = 1
                    .Invent.AnilloEqpObjIndex = ObjIndex
                    .Invent.AnilloEqpSlot = Slot

                    'pluto:2.4
                    If ObjData(.Invent.AnilloEqpObjIndex).SubTipo = 1 Then

                        'pluto:2.11
                        If .flags.Angel = 0 And .flags.Demonio = 0 And .flags.Morph = 0 And MapInfo(.Pos.Map).Pk = True Then

                            If .Pos.Map > 199 And .Pos.Map < 212 Then Exit Sub
                            .flags.Invisible = 1
                            Call SendData(ToIndex, Userindex, 0, "INVI")
                            Call SendData2(ToMap, 0, .Pos.Map, 16, .Char.CharIndex & ",1")

                        End If

                    End If

                    'pluto:2.4
                    If ObjData(.Invent.AnilloEqpObjIndex).SubTipo = 5 Then
                        .Stats.PesoMax = .Stats.PesoMax + 500
                        Call SendUserStatsPeso(Userindex)

                    End If

                    If ObjData(.Invent.AnilloEqpObjIndex).SubTipo = 2 Then

                        If .flags.Morph > 0 Or .flags.Angel = 1 Or .flags.Demonio = 1 Or .flags.Navegando = 1 Then Exit Sub
                        .flags.Morph = .Char.Body
                        .Counters.Morph = IntervaloMorphPJ
                        Dim abody As Integer
                        Dim al    As Integer
                        al = RandomNumber(1, 12)

                        Select Case al

                            Case 1
                                abody = 5

                            Case 2
                                abody = 6

                            Case 3
                                abody = 9

                            Case 4
                                abody = 10

                            Case 5
                                abody = 13

                            Case 6
                                abody = 42

                            Case 7
                                abody = 51

                            Case 8
                                abody = 59

                            Case 9
                                abody = 68

                            Case 10
                                abody = 71

                            Case 11
                                abody = 73

                            Case 12
                                abody = 88

                        End Select

                        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, val(abody), val(0), .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                        Call SendData(ToPCArea, Userindex, .Pos.Map, "CFX" & .Char.CharIndex & "," & Hechizos(43).FXgrh & "," & Hechizos(43).loops)

                    End If

                Else
                    Call SendData(ToIndex, Userindex, 0, "J4")

                    'Call SendData(ToIndex, UserIndex, 0, "||Tu clase no puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                End If

            Case OBJTYPE_FLECHAS

                If ClasePuedeUsarItem(Userindex, .Invent.Object(Slot).ObjIndex) And FaccionPuedeUsarItem(Userindex, ObjIndex) And SkillsPuedeUsarItem(Userindex, ObjIndex) Then

                    'Si esta equipado lo quita
                    If .Invent.Object(Slot).Equipped Then
                        'Quitamos del inv el item
                        Call Desequipar(Userindex, Slot)
                        Exit Sub

                    End If

                    'Quitamos el elemento anterior
                    If .Invent.MunicionEqpObjIndex > 0 Then
                        Call Desequipar(Userindex, .Invent.MunicionEqpSlot)

                    End If

                    .Invent.Object(Slot).Equipped = 1
                    .Invent.MunicionEqpObjIndex = .Invent.Object(Slot).ObjIndex
                    .Invent.MunicionEqpSlot = Slot

                Else
                    Call SendData(ToIndex, Userindex, 0, "J4")

                    'Call SendData(ToIndex, UserIndex, 0, "||Tu clase no puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                End If

            Case OBJTYPE_ARMOUR

                If obj.GrhIndex = 25970 And Not .flags.LiderAlianza = 1 Then Exit Sub

                If obj.GrhIndex = 26023 And Not .flags.LiderHorda = 1 Then Exit Sub
        
                If .flags.Navegando = 1 Then Exit Sub

                Select Case obj.SubTipo

                    Case OBJTYPE_ARMADURA

                        'pluto:2.3
                        If .flags.Montura = 1 Then Exit Sub

                        'Nos aseguramos que puede usarla
                        If ClasePuedeUsarItem(Userindex, .Invent.Object(Slot).ObjIndex) And SexoPuedeUsarItem(Userindex, .Invent.Object(Slot).ObjIndex) And CheckRazaUsaRopa(Userindex, .Invent.Object(Slot).ObjIndex) And FaccionPuedeUsarItem(Userindex, ObjIndex) And SkillsPuedeUsarItem(Userindex, ObjIndex) Then

                            'Si esta equipado lo quita
                            If .Invent.Object(Slot).Equipped Then
                                Call Desequipar(Userindex, Slot)
                                Call DarCuerpoDesnudo(Userindex)
                                '[GAU] Agregamo .Char.Botas
                                Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                                Exit Sub

                            End If

                            'Quita el anterior
                            If .Invent.ArmourEqpObjIndex > 0 Then
                                Call Desequipar(Userindex, .Invent.ArmourEqpSlot)

                            End If

                            'Lo equipa
                            .Invent.Object(Slot).Equipped = 1
                            .Invent.ArmourEqpObjIndex = .Invent.Object(Slot).ObjIndex
                            .Invent.ArmourEqpSlot = Slot

                            .Char.Body = obj.Ropaje

                            'pluto:2-3-04
                            If .Remort = 1 Then

                                If .Char.Body = 196 Then .Char.Body = 262

                                If .Char.Body = 197 Then .Char.Body = 263

                            End If

                            .flags.Desnudo = 0

                            'objeto especial
                            Select Case ObjData(.Invent.ArmourEqpObjIndex).objetoespecial

                                Case 2
                                    .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 5

                                Case 3
                                    .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 2

                                Case 4
                                    .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 3

                                Case 5
                                    .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 5

                                Case 6
                                    .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2

                                Case 7
                                    .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 3

                                Case 8
                                    .Stats.MaxMAN = .Stats.MaxMAN + 100
                                    Call SendUserStatsMana(Userindex)

                                Case 9
                                    .Stats.MaxMAN = .Stats.MaxMAN + 200
                                    Call SendUserStatsMana(Userindex)

                                Case 10
                                    .Stats.MaxMAN = .Stats.MaxMAN + 300
                                    Call SendUserStatsMana(Userindex)

                                    'pluto:6.5----------------------
                                Case 14
                                    .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 5
                                    .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2

                                    '-------------------------------
                                    'pluto:7.0--------------------
                                Case 16
                                    .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 1
                                    .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 1

                                Case 17
                                    .Stats.MaxMAN = .Stats.MaxMAN + 200
                                    .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2

                                Case 18
                                    .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 1

                                Case 19
                                    .Stats.MaxMAN = .Stats.MaxMAN + 55

                                    '-------------------------------------
                            End Select

                            ' If ObjData(.Invent.ArmourEqpObjIndex).objetoespecial = 5 Then
                            '.Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 5
                            ' End If
                            '   If ObjData(.Invent.ArmourEqpObjIndex).objetoespecial = 6 Then
                            '.Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2
                            'End If
                            ' If ObjData(.Invent.ArmourEqpObjIndex).objetoespecial = 7 Then
                            '.Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 3
                            ' End If
                            '    If ObjData(.Invent.ArmourEqpObjIndex).objetoespecial = 8 Then
                            ' .Stats.MaxMAN = .Stats.MaxMAN + 100
                            'End If
                            ' If ObjData(.Invent.ArmourEqpObjIndex).objetoespecial = 9 Then
                            '  .Stats.MaxMAN = .Stats.MaxMAN + 200
                            'End If
                            ' If ObjData(.Invent.ArmourEqpObjIndex).objetoespecial = 10 Then
                            '.Stats.MaxMAN = .Stats.MaxMAN + 300
                            ' End If

                            '[GAU] Agregamo .Char.Botas
                            Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                        Else
                            Call SendData(ToIndex, Userindex, 0, "J4")

                            'Call SendData(ToIndex, UserIndex, 0, "||Tu clase,genero o raza no puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                        End If

                    Case OBJTYPE_CASCO

                        If ClasePuedeUsarItem(Userindex, .Invent.Object(Slot).ObjIndex) Then

                            'Si esta equipado lo quita
                            If .Invent.Object(Slot).Equipped Then
                                Call Desequipar(Userindex, Slot)
                                .Char.CascoAnim = NingunCasco
                                '[GAU] Agregamo .Char.Botas
                                Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                                Exit Sub

                            End If

                            'Quita el anterior
                            If .Invent.CascoEqpObjIndex > 0 Then
                                Call Desequipar(Userindex, .Invent.CascoEqpSlot)

                            End If

                            'Lo equipa

                            .Invent.Object(Slot).Equipped = 1
                            .Invent.CascoEqpObjIndex = .Invent.Object(Slot).ObjIndex
                            .Invent.CascoEqpSlot = Slot

                            .Char.CascoAnim = obj.CascoAnim

                            'objeto especial
                            If ObjData(.Invent.CascoEqpObjIndex).objetoespecial = 5 Then
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 5

                            End If

                            If ObjData(.Invent.CascoEqpObjIndex).objetoespecial = 6 Then
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2

                            End If

                            If ObjData(.Invent.CascoEqpObjIndex).objetoespecial = 7 Then
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 3

                            End If

                            If ObjData(.Invent.CascoEqpObjIndex).objetoespecial = 8 Then
                                .Stats.MaxMAN = .Stats.MaxMAN + 100
                                Call SendUserStatsMana(Userindex)

                            End If

                            If ObjData(.Invent.CascoEqpObjIndex).objetoespecial = 9 Then
                                .Stats.MaxMAN = .Stats.MaxMAN + 200
                                Call SendUserStatsMana(Userindex)

                            End If

                            If ObjData(.Invent.CascoEqpObjIndex).objetoespecial = 10 Then
                                .Stats.MaxMAN = .Stats.MaxMAN + 300
                                Call SendUserStatsMana(Userindex)

                            End If

                            'pluto:7.0
                            If ObjData(.Invent.CascoEqpObjIndex).objetoespecial = 18 Then
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 1

                            End If

                            '[GAU] Agregamo .Char.Botas
                            Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                        Else
                            Call SendData(ToIndex, Userindex, 0, "J4")

                            'Call SendData(ToIndex, UserIndex, 0, "||Tu clase no puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                        End If

                        '[GAU] Agregar todo ESTO!!!!!
                    Case OBJTYPE_BOTA

                        If ClasePuedeUsarItem(Userindex, .Invent.Object(Slot).ObjIndex) Then

                            'Si esta equipado lo quita
                            If .Invent.Object(Slot).Equipped Then
                                Call Desequipar(Userindex, Slot)
                                .Char.Botas = NingunBota
                                Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                                Exit Sub

                            End If

                            'Quita el anterior
                            If .Invent.BotaEqpObjIndex > 0 Then
                                Call Desequipar(Userindex, .Invent.BotaEqpSlot)

                            End If

                            'Lo equipa

                            .Invent.Object(Slot).Equipped = 1
                            .Invent.BotaEqpObjIndex = .Invent.Object(Slot).ObjIndex
                            .Invent.BotaEqpSlot = Slot

                            .Char.Botas = obj.Botas
                            Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                        Else
                            Call SendData(ToIndex, Userindex, 0, "J4")

                            'Call SendData(ToIndex, UserIndex, 0, "||Tu clase no puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                        End If

                        '[GAU] HASTA AK!!!!

                    Case OBJTYPE_ALAS

                        If ClasePuedeUsarItem(Userindex, .Invent.Object(Slot).ObjIndex) Then

                            'Si esta equipado lo quita
                            If .Invent.Object(Slot).Equipped Then
                                Call Desequipar(Userindex, Slot)
                                .Char.AlasAnim = NingunAla
                                Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                                Exit Sub

                            End If

                            'Quita el anterior
                            If .Invent.AlaEqpObjIndex > 0 Then
                                Call Desequipar(Userindex, .Invent.AlaEqpSlot)

                            End If

                            'Lo equipa

                            .Invent.Object(Slot).Equipped = 1
                            .Invent.AlaEqpObjIndex = .Invent.Object(Slot).ObjIndex
                            .Invent.AlaEqpSlot = Slot

                            .Char.AlasAnim = obj.AlasAnim
                            Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
                        Else
                            Call SendData(ToIndex, Userindex, 0, "J4")

                            'Call SendData(ToIndex, UserIndex, 0, "||Tu clase no puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                        End If

                    Case OBJTYPE_ESCUDO

                        If ClasePuedeUsarItem(Userindex, .Invent.Object(Slot).ObjIndex) Then

                            'Si esta equipado lo quita
                            If .Invent.Object(Slot).Equipped Then
                                Call Desequipar(Userindex, Slot)
                                .Char.ShieldAnim = NingunEscudo
                                '[GAU] Agregamo .Char.Botas
                                Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                                Exit Sub

                            End If

                            'Quita el anterior
                            If .Invent.EscudoEqpObjIndex > 0 Then
                                Call Desequipar(Userindex, .Invent.EscudoEqpSlot)

                            End If

                            'Lo equipa

                            .Invent.Object(Slot).Equipped = 1
                            .Invent.EscudoEqpObjIndex = .Invent.Object(Slot).ObjIndex
                            .Invent.EscudoEqpSlot = Slot

                            .Char.ShieldAnim = obj.ShieldAnim

                            'quitar esto
                            '.Char.ShieldAnim = 33
                            'objeto especial
                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 5 Then
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 5

                            End If

                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 6 Then
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2

                            End If

                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 7 Then
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 3

                            End If

                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 2 Then
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 5

                            End If

                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 3 Then
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 2

                            End If

                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 4 Then
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 3

                            End If

                            'pluto:6.5---------
                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 12 Then
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 1
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 3

                            End If

                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 13 Then
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 2
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2

                            End If

                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 14 Then
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 5
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2

                            End If

                            If ObjData(.Invent.EscudoEqpObjIndex).objetoespecial = 15 Then
                                .Stats.UserAtributosBackUP(Fuerza) = .Stats.UserAtributosBackUP(Fuerza) + 3
                                .Stats.UserAtributosBackUP(Agilidad) = .Stats.UserAtributosBackUP(Agilidad) + 2

                            End If

                            '----------------

                            '[GAU] Agregamo .Char.Botas
                            Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                        Else
                            Call SendData(ToIndex, Userindex, 0, "J4")

                            'Call SendData(ToIndex, UserIndex, 0, "||Tu clase no puede usar este objeto." & FONTTYPENAMES.FONTTYPE_INFO)
                        End If

                End Select

        End Select

        'Actualiza
        'Call UpdateUserInv(True, userindex, 0)
        'pluto:2.4
        Call UpdateUserInv(False, Userindex, Slot)

        'pluto:6.5
        If ObjData(ObjIndex).objetoespecial > 1 Then
            Dim loopX As Integer

            For loopX = 1 To NUMATRIBUTOS
                .Stats.UserAtributos(loopX) = .Stats.UserAtributosBackUP(loopX)
            Next

        End If

    End With

    Exit Sub
errhandler:
    Call LogError("EquiparInvItem Slot:" & Slot)

End Sub

Private Function CheckRazaUsaRopa(ByVal Userindex As Integer, _
                                  itemIndex As Integer) As Boolean

    On Error GoTo errhandler

    'pluto:6.3 añado papa noel(1016)
    If UserList(Userindex).flags.Privilegios > 0 Or itemIndex = 1016 Then
        CheckRazaUsaRopa = True
        Exit Function

    End If

    'pluto.7.0 añade ciclope
    'Verifica si la raza puede usar la ropa
    If UserList(Userindex).raza = "Humano" Or UserList(Userindex).raza = "Elfo" Or UserList(Userindex).raza = _
       "Vampiro" Or UserList(Userindex).raza = "Orco" Or UserList(Userindex).raza = "Abisario" Or UserList( _
       Userindex).raza = "Elfo Oscuro" Or UserList(Userindex).raza = "NoMuerto" Or UserList(Userindex).raza = "Licantropos" Or UserList(Userindex).raza = "Tauros" Then
        CheckRazaUsaRopa = (ObjData(itemIndex).RazaEnana = 0)
    Else
        CheckRazaUsaRopa = (ObjData(itemIndex).RazaEnana = 1)

    End If

    Exit Function
errhandler:
    Call LogError("Error CheckRazaUsaRopa ItemIndex:" & itemIndex)

End Function

Sub UseInvItem(ByVal Userindex As Integer, ByVal Slot As Byte)

    On Error GoTo fallo

    'Usa un item del inventario
    Dim obj As ObjData
    Dim ObjIndex As Integer
    Dim TargObj As ObjData
    Dim MiObj As obj
    Dim C As Integer
    Dim va1 As Integer
    Dim va2 As Integer
    Dim va3 As Integer
    Dim Cachis As Byte
    obj = ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex)

    If UserList(Userindex).flags.Privilegios > 0 Then GoTo sipuede

    If obj.Newbie = 1 And Not EsNewbie(Userindex) Then
        Call SendData(ToIndex, Userindex, 0, "||Solo los newbies pueden usar estos objetos." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'comprueba si es elfo
    If obj.razaelfa = 1 And UserList(Userindex).raza <> "Elfo" And UserList(Userindex).raza <> "Elfo Oscuro" Then
        Call SendData(ToIndex, Userindex, 0, "||Solo los Elfos pueden usar este objeto." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'comprueba si es vampiro
    If obj.razavampiro = 1 And UserList(Userindex).raza <> "Vampiro" Then
        Call SendData(ToIndex, Userindex, 0, "||Solo los Vampiros pueden usar este objeto." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'comprueba si es enano
    If obj.RazaEnana = 1 And UserList(Userindex).raza <> "Enano" Then
        Call SendData(ToIndex, Userindex, 0, "||Solo los Enanos pueden usar este objeto." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'comprueba si es humano
    If obj.razahumana = 1 And UserList(Userindex).raza <> "Humano" Then
        Call SendData(ToIndex, Userindex, 0, "||Solo los Humanos pueden usar este objeto." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'comprueba si es orco
    If obj.razaorca = 1 And UserList(Userindex).raza <> "Orco" Then
        Call SendData(ToIndex, Userindex, 0, "||Solo los Orcos pueden usar este objeto." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

sipuede:

    ObjIndex = UserList(Userindex).Invent.Object(Slot).ObjIndex
    UserList(Userindex).flags.TargetObjInvIndex = ObjIndex
    UserList(Userindex).flags.TargetObjInvSlot = Slot

    Select Case obj.OBJType

        'pluto:6.8-------Puntos Clan------------------------------------
    Case 72

        If UserList(Userindex).Stats.PClan >= 0 Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes Puntos Clan en Negativo." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UserList(Userindex).Stats.GLD < (UserList(Userindex).Stats.ELV * 500) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente Oro." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'Sonido
        SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW45"
        UserList(Userindex).Stats.PClan = UserList(Userindex).Stats.PClan + 1
        UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - (UserList(Userindex).Stats.ELV * 500)

        Call QuitarUserInvItem(Userindex, Slot, 1)
        Call SendData(ToIndex, Userindex, 0, "||Has Ganado un Punto de Clan!! " & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "||Has Gastado " & (UserList(Userindex).Stats.ELV * 500) & _
                                             " Monedas de Oro." & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendUserStatsOro(Userindex)
        Call UpdateUserInv(False, Userindex, Slot)
        Exit Sub

        'pluto:6.5-------elixir de vida------------------------------------
    Case 63

       ' If UserList(Userindex).flags.Elixir >= 3 Then
        '    Call SendData(ToIndex, Userindex, 0, "||No te hace ningún efecto." & "´" & FontTypeNames.FONTTYPE_INFO)
        '    Exit Sub

       ' End If

        'Sonido
       ' SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER
       ' UserList(Userindex).flags.Elixir = UserList(Userindex).flags.Elixir + 1

       ' Call QuitarUserInvItem(Userindex, Slot, 1)
        'Call SendData(ToIndex, Userindex, 0, "||Obtendrás una bonificación de " & UserList( _
                                             Userindex).flags.Elixir & " Puntos de vida al pasar al siguiente Nivel." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
       ' Call UpdateUserInv(False, Userindex, Slot)
       ' Exit Sub

    Case 62
        'Sonido
        'SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER
        'UserList(Userindex).flags.Elixir = 10

        'Call QuitarUserInvItem(Userindex, Slot, 1)
        'Call SendData(ToIndex, Userindex, 0, _
                      "||Obtendrás el Máximo de Puntos de Vida cuando pases al siguiente Nivel." & "´" & _
                      FontTypeNames.FONTTYPE_INFO)
       ' Call UpdateUserInv(False, Userindex, Slot)
        'Exit Sub

    Case 67    'bolsitas vida
        'Sonido
        Dim Bolsita As Long

        If obj.GrhIndex = 23583 Then Bolsita = 25000
        If obj.GrhIndex = 23584 Then Bolsita = 50000

        SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_DINERO
        Call AddtoVar(UserList(Userindex).Stats.GLD, Bolsita, MAXORO)

        Call QuitarUserInvItem(Userindex, Slot, 1)
        Call SendData(ToIndex, Userindex, 0, "||Has ganado " & Bolsita & " Monedas de Oro." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Call UpdateUserInv(False, Userindex, Slot)
        Call SendUserStatsOro(Userindex)
        Exit Sub

    Case 68    'poción protección pluto:6.5
        UserList(Userindex).Counters.Protec = 500
        UserList(Userindex).flags.Protec = 10
        Call SendData(ToIndex, Userindex, 0, "S1")
        Call SendData(ToIndex, Userindex, 0, "||Circulo de Protección Mágica" & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & _
                                                                             "," & 102 & "," & 1)
        Call QuitarUserInvItem(Userindex, Slot, 1)
        Call UpdateUserInv(False, Userindex, Slot)
        Exit Sub
        '------------------------------------------------------------------------

        'pluto:2.11------------------------------------
    Case 50
    
    If UserList(Userindex).Pos.Map > 199 And UserList(Userindex).Pos.Map < 212 Then Exit Sub
    If UserList(Userindex).Pos.Map = 182 Or UserList(Userindex).Pos.Map = 92 Or UserList(Userindex).Pos.Map = 279 Then Exit Sub

        If UserList(Userindex).flags.Angel = 0 And UserList(Userindex).flags.Demonio = 0 And UserList( _
           Userindex).flags.Morph = 0 And MapInfo(UserList(Userindex).Pos.Map).Pk = True Then

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            If UserList(Userindex).flags.Invisible = 1 Then
                UserList(Userindex).flags.Invisible = 0
                UserList(Userindex).flags.Oculto = 0
                UserList(Userindex).Counters.Invisibilidad = 0
                Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 16, UserList(Userindex).Char.CharIndex & ",0")
            Else
                UserList(Userindex).flags.Invisible = 1
                Call SendData(ToIndex, Userindex, 0, "INVI")
                Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 16, UserList(Userindex).Char.CharIndex & ",1")

            End If

        End If

        '-----------------------------------------------
    Case OBJTYPE_USEONCE

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'Usa el item
        Call AddtoVar(UserList(Userindex).Stats.MinHam, obj.MinHam, UserList(Userindex).Stats.MaxHam)
        UserList(Userindex).flags.Hambre = 0
        Call EnviarHambreYsed(Userindex)

        'pluto:6.2------ Sube Energía Newbies con Comida
        If EsNewbie(Userindex) Then
            Call AddtoVar(UserList(Userindex).Stats.MinSta, obj.MinHam, UserList(Userindex).Stats.MaxSta)

        End If

        '---------------
        'Sonido
        SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_COMIDA

        'Quitamos del inv el item
        Call QuitarUserInvItem(Userindex, Slot, 1)

        'libros pluto:2.17
    Case 12

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        Dim a As Byte
        a = RandomNumber(1, 10)

        'malditos--------------------------------------
        If a = 3 Then
            UserList(Userindex).Stats.MinHP = 1
            Call SendData(ToIndex, Userindex, 0, "||¡¡Libro Maldito!!" & "´" & FontTypeNames.FONTTYPE_INFO)

            Call QuitarUserInvItem(Userindex, Slot, 1)
            SendUserStatsVida (Userindex)
            'pluto:2.22
            Call senduserstatsbox(Userindex)
            Call UpdateUserInv(False, Userindex, Slot)
            Exit Sub

        End If

        If a = 4 And Not Criminal(Userindex) Then
            Call WarpUserChar(Userindex, 170, Nix.X + RandomNumber(1, 5), Nix.Y, True)
            Call QuitarUserInvItem(Userindex, Slot, 1)
            Call SendData(ToIndex, Userindex, 0, "||¡¡Libro Maldito!!" & "´" & FontTypeNames.FONTTYPE_INFO)
            'pluto:2.22
            Call senduserstatsbox(Userindex)
            Call UpdateUserInv(False, Userindex, Slot)
            Exit Sub

        End If

        If a = 4 And Criminal(Userindex) Then
            Call WarpUserChar(Userindex, Banderbill.Map, Banderbill.X, Banderbill.Y - RandomNumber(1, 5), True)
            Call QuitarUserInvItem(Userindex, Slot, 1)
            Call SendData(ToIndex, Userindex, 0, "||¡¡Libro Maldito!!" & "´" & FontTypeNames.FONTTYPE_INFO)
            'pluto:2.22
            Call senduserstatsbox(Userindex)
            Call UpdateUserInv(False, Userindex, Slot)
            Exit Sub

        End If

        '--------------------------------

        If obj.GrhIndex = 538 Then

            'pluto:6.0A-----------------------------------------------------
            Dim AdiHp As Byte
            Dim AdihpR As Integer


            'Usa el item libro vida
            If UserList(Userindex).Remort = 1 Then

                Select Case UserList(Userindex).clase

                Case "Guerrero"
                    AdihpR = 800

                Case "Cazador"
                    AdihpR = 700

                Case "Arquero"
                    AdihpR = 500

                Case "Ladron"
                    AdihpR = 625

                Case "Pirata"
                    AdihpR = 750

                Case "Paladin"
                    AdihpR = 650

                Case "Mago"
                    AdihpR = 450

                Case "Clerigo"
                    AdihpR = 600

                Case "Asesino"
                    AdihpR = 650

                Case "Bardo"
                    AdihpR = 600

                Case "Druida"
                    AdihpR = 550

                Case Else
                    AdihpR = 600

                End Select
            Else
                Select Case UserList(Userindex).clase

                Case "Guerrero"
                    AdihpR = 850

                Case "Cazador"
                    AdihpR = 750

                Case "Arquero"
                    AdihpR = 550

                Case "Ladron"
                    AdihpR = 675

                Case "Pirata"
                    AdihpR = 800

                Case "Paladin"
                    AdihpR = 700

                Case "Mago"
                    AdihpR = 525

                Case "Clerigo"
                    AdihpR = 675

                Case "Asesino"
                    AdihpR = 675

                Case "Bardo"
                    AdihpR = 675

                Case "Druida"
                    AdihpR = 600

                Case Else
                    AdihpR = 650

                End Select

            End If    'remort

            'If UserList(Userindex).Remort = 1 Then
            If UserList(Userindex).Stats.MaxHP >= AdihpR Then
                UserList(Userindex).Stats.MaxHP = AdihpR
                Call SendData(ToIndex, Userindex, 0, _
                              "||No puedes usar más Libros de Vida, tienes el máximo para tu clase." & "´" & _
                              FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'Else 'no remort

            'If UserList(Userindex).Stats.LibrosUsados >= (((UserList(Userindex).Stats.UserAtributos( _
             Constitucion) \ 2) + AdiHp) * 2) Then
            'Call SendData(ToIndex, Userindex, 0, "||No puedes usar más Libros de Vida" & "´" & _
             FontTypeNames.FONTTYPE_INFO)
            'Exit Sub

            'End If

            'End If 'remort

            'añadimos el punto respetando topes de vida
            If UserList(Userindex).Remort = 1 Then
                Call AddtoVar(UserList(Userindex).Stats.MaxHP, 1, AdihpR)
                Call SendData(ToIndex, Userindex, 0, "||¡¡Ganas 1 punto de Vida!!" & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Call SendData(ToIndex, Userindex, 0, "||¡¡Puedes usar Libros mientrás no superes los " & AdihpR & _
                                                     " de vida." & "´" & FontTypeNames.FONTTYPE_INFO)
            Else
                Call AddtoVar(UserList(Userindex).Stats.MaxHP, 1, STAT_MAXHP)
                Call SendData(ToIndex, Userindex, 0, "||¡¡Ganas 1 punto de Vida!!" & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Call SendData(ToIndex, Userindex, 0, "||¡¡Sólo puedes usar " & UserList( _
                                                     Userindex).Stats.LibrosUsados - (((UserList(Userindex).Stats.UserAtributos(Constitucion) _
                                                                                        \ 2) + AdiHp) * 2) & " Libros más !!" & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            UserList(Userindex).Stats.LibrosUsados = UserList(Userindex).Stats.LibrosUsados + 1
            '---------------------------fin pluto:6.0A-----------------------------------------

            ' UserList(UserIndex).Stats.MaxHP = UserList(UserIndex).Stats.MaxHP + 1

            'Sonido
            SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_resu
            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)
            SendUserStatsVida (Userindex)
            'End If
        End If    '538

        '-------------------------------
        

        If obj.GrhIndex = 539 Then
            'Usa el item
            UserList(Userindex).Stats.Puntos = UserList(Userindex).Stats.Puntos + 20
            Call SendData(ToIndex, Userindex, 0, "||¡¡Ganas 20 Puntos de Canje!!" & "´" & FontTypeNames.FONTTYPE_INFO)
            'Sonido
            SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_resu
            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)
            Dim PuntosC As Integer
            PuntosC = UserList(Userindex).Stats.Puntos
            Call SendData(ToIndex, Userindex, 0, "J5" & PuntosC)
            
        End If    '539

        If obj.GrhIndex = 18530 Then
            'Usa el item
            UserList(Userindex).Stats.SkillPts = UserList(Userindex).Stats.SkillPts + 2
            Call SendData(ToIndex, Userindex, 0, "||¡¡Ganas 2 Puntos de Habilidad para Asignar!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            'Sonido
            SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_resu
            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)
            SendUserStatsVida (Userindex)
        End If    '18530

        '-------------------------------
        'amuleto resucitar
    Case OBJTYPE_resu

        If UserList(Userindex).flags.Muerto <> 1 Then
            Call SendData(ToIndex, Userindex, 0, _
                          "||¡¡Estas vivo!! Solo podes usar este items cuando estas muerto." & "´" & _
                          FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'pluto:6.0A
        If UserList(Userindex).flags.Navegando > 0 Then
            Call SendData(ToIndex, Userindex, 0, _
                          "||¡¡Estas Navegando!! Solo podes usar este items cuando este en tierra." & "´" & _
                          FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'pluto:6.0A
        If MapInfo(UserList(Userindex).Pos.Map).Resucitar = 1 Then Exit Sub

        'Usa el item
        Call RevivirUsuario(Userindex)
        Call SendData(ToIndex, Userindex, 0, "||¡¡Hás sido resucitado!!" & "´" & FontTypeNames.FONTTYPE_INFO)

        'Sonido
        SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_resu

        'Quitamos del inv el item
        Call QuitarUserInvItem(Userindex, Slot, 1)

        'regalo
    Case OBJTYPE_regalo

        Dim rega As Integer
        Dim rega2 As Integer
        Dim rega3 As Integer
        Dim Rr As Byte
        Dim Reox As Byte

        rega2 = RandomNumber(1, 400)

        If rega2 + UserList(Userindex).Stats.UserSkills(suerte) < 380 Then Rr = 1
        If rega2 + UserList(Userindex).Stats.UserSkills(suerte) > 379 Then Rr = 2
        If rega2 + UserList(Userindex).Stats.UserSkills(suerte) > 489 Then Rr = 3

        'pluto:6.5
        If Rr = 0 Then Rr = 1

        Select Case Rr

        Case 1
            rega3 = RandomNumber(1, Reo1)
            rega = ObjRegalo1(rega3)

        Case 2
            rega3 = RandomNumber(1, Reo2)
            rega = ObjRegalo2(rega3)

        Case 3
            rega3 = RandomNumber(1, Reo3)
            rega = ObjRegalo3(rega3)

        End Select

        'pluto:6.5
        If ObjData(rega).Pregalo = 0 Then rega = 158

        MiObj.ObjIndex = rega

        If ObjData(rega).Cregalos = 0 Then ObjData(rega).Cregalos = 1
        MiObj.Amount = ObjData(rega).Cregalos
        Call QuitarUserInvItem(Userindex, Slot, 1)

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        End If

        'pluto:2.14
        If UserList(Userindex).flags.Privilegios > 0 Then
            Call LogGM(UserList(Userindex).Name, "Regalo/Cofre: " & ObjData(rega).Name)

        End If

        'pluto:2.4 sonidos regalos y cofres
        If ObjIndex = 866 Then
            Call SendData(ToIndex, Userindex, 0, "||¡¡Hás abierto un regalo!!" & "´" & FontTypeNames.FONTTYPE_INFO)
            'Sonido
            SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 118
        Else
            Call SendData(ToIndex, Userindex, 0, "||¡¡Hás abierto un Cofre!!" & "´" & FontTypeNames.FONTTYPE_INFO)
            'Sonido
            SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 120

        End If

        'baston sube mana
    Case OBJTYPE_WEAPON
        'pluto:2.22
        Dim Manita As Integer

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If obj.objetoespecial > 0 Then

            Select Case obj.objetoespecial

            Case 51

                If Not IntervaloPermiteTomar(Userindex) Then Exit Sub
                If UCase$(UserList(Userindex).clase) = "CLERIGO" Or UCase$(UserList(Userindex).clase) = _
                   "MAGO" Then
                    Manita = 50    'Int(Porcentaje(UserList(UserIndex).Stats.MaxHP, 10))

                    Call AddtoVar(UserList(Userindex).Stats.MinHP, Manita, UserList(Userindex).Stats.MaxHP)
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 47)
                    'pluto:2.14
                    SendUserStatsVida (Userindex)

                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Sólo los Clérigos o Magos pueden usar este objeto. " & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)

                End If

            Case 52

                'If UCase$(UserList(UserIndex).clase) = "CLERIGO" Or UCase$(UserList(UserIndex).clase) = "MAGO" Then
                If Not UserList(Userindex).Invent.WeaponEqpObjIndex = 840 Then
                    Call SendData(ToIndex, Userindex, 0, "||No tienes equipado el objeto!!. " & "´" & _
                                                         FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                Call AddtoVar(UserList(Userindex).Stats.MinHam, 50, UserList(Userindex).Stats.MaxHam)
                Call AddtoVar(UserList(Userindex).Stats.MinAGU, 50, UserList(Userindex).Stats.MaxAGU)
                UserList(Userindex).flags.Sed = 0
                UserList(Userindex).flags.Hambre = 0
                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 47)
                Call EnviarHambreYsed(Userindex)
                'Else
                'Call SendData(ToIndex, UserIndex, 0, "||Sólo los Clérigos pueden usar este objeto. " & "´" & FontTypeNames.FONTTYPE_info)
                'End If

            Case 50

                'nati:solo si esta equipado
                If UCase$(UserList(Userindex).clase) = "MAGO" Then
                    If Not UserList(Userindex).Invent.WeaponEqpObjIndex = 842 Then
                        Call SendData(ToIndex, Userindex, 0, "||No tienes equipado el objeto!!. " & "´" & _
                                                             FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    Manita = Int(Porcentaje(UserList(Userindex).Stats.MaxMAN, 10))

                    Call AddtoVar(UserList(Userindex).Stats.MinMAN, Manita, UserList(Userindex).Stats.MaxMAN)
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 47)
                    'pluto:2.14
                    SendUserStatsMana (Userindex)
                Else
                    Call SendData(ToIndex, Userindex, 0, "||Sólo los Magos pueden usar este objeto. " & "´" & _
                                                         FontTypeNames.FONTTYPE_INFO)

                End If

            Case 55
                'pluto:2.17

                'If UserList(Userindex).raza = "Elfo Oscuro" Then
                 '   If Len(UserList(Userindex).Padre) = 0 Then
                  '      Exit Sub

                   ' End If

                'End If

                If UserList(Userindex).flags.DuracionEfecto = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "S1")

                End If

                UserList(Userindex).flags.TomoPocion = True
                UserList(Userindex).flags.TipoPocion = 1
                UserList(Userindex).flags.DuracionEfecto = 1000

                'Usa el item
                Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Agilidad), 5, UserList( _
                                                                                    Userindex).Stats.UserAtributosBackUP(Agilidad) + 13)
                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 47)

            End Select

        End If

        If ObjData(ObjIndex).proyectil = 1 Then
            Call SendData2(ToIndex, Userindex, 0, 31, Proyectiles)
        Else

            If UserList(Userindex).flags.TargetObj = 0 Then Exit Sub
            TargObj = ObjData(UserList(Userindex).flags.TargetObj)

            '¿El target-objeto es leña?
            If TargObj.OBJType = OBJTYPE_LEÑA Then
                If UserList(Userindex).Invent.Object(Slot).ObjIndex = DAGA Then
                    Call TratarDeHacerFogata(UserList(Userindex).flags.TargetObjMap, UserList( _
                                                                                     Userindex).flags.TargetObjX, UserList(Userindex).flags.TargetObjY, Userindex)

                End If

            End If

        End If

        'amuleto quitarparalisis
    Case OBJTYPE_para

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If UserList(Userindex).flags.Paralizado = 0 Then

            Call SendData(ToIndex, Userindex, 0, "||¡¡No estás Paralizado!! " & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub
        Else
            'Usa el item
            UserList(Userindex).flags.Paralizado = 1
            UserList(Userindex).flags.Paralizado = 0
            Call SendData2(ToIndex, Userindex, 0, 68)
            Call SendData(ToIndex, Userindex, 0, "||Te has quitado la paralisis." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

            'Sonido
            SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_para

            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)

        End If

        'amuleto sanacion
    Case OBJTYPE_sana

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'PLUTO:6.0A
        If UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP Then Exit Sub
        '--------

        'Usa el item
        UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP
        Call SendData(ToIndex, Userindex, 0, "||¡¡Hás sanado completamente!!" & "´" & FontTypeNames.FONTTYPE_INFO)

        'Sonido
        SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_sana

        'Quitamos del inv el item
        Call QuitarUserInvItem(Userindex, Slot, 1)

        'amuleto teleport: 'pluto:2.14 +c a los telep
    Case OBJTYPE_tele

        'pluto:6.0a
        If UserList(Userindex).Counters.Pena > 0 Or UserList(Userindex).Pos.Map = 191 Then Exit Sub

        'pluto:2.15
        If UserList(Userindex).flags.Paralizado > 0 Then
            Call SendData(ToIndex, Userindex, 0, "L99")
            Call SendData(ToIndex, Userindex, 0, "||No puedes estando paralizado!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        C = RandomNumber(1, 5)

        If C = 1 Then
            va1 = Nix.Map
            va2 = Nix.X + C
            va3 = Nix.Y

        End If

        If C = 2 Then
            va1 = Banderbill.Map
            va2 = Banderbill.X
            va3 = Banderbill.Y - C

        End If

        If C = 3 Then
            va1 = Ullathorpe.Map
            va2 = Ullathorpe.X + C
            va3 = Ullathorpe.Y

        End If

        If C = 4 Then
            va1 = Lindos.Map
            va2 = Lindos.X
            va3 = Lindos.Y

        End If

        If C = 5 Then
            va1 = 170
            va2 = 34
            va3 = 34 + C

        End If

        'Usa el item

        Call WarpUserChar(Userindex, va1, va2, va3, True)
        'PLUTO:6.0a
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & _
                                                                             "," & 100 & "," & 1)
        'Sonido
        SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_tele

        'Quitamos del inv el item
        Call QuitarUserInvItem(Userindex, Slot, 1)

    Case OBJTYPE_GUITA

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'UserList(UserIndex).Stats.GLD = UserList(UserIndex).Stats.GLD + UserList(UserIndex).Invent.Object(Slot).Amount
        Call AddtoVar(UserList(Userindex).Stats.GLD, UserList(Userindex).Invent.Object(Slot).Amount, MAXORO)

        UserList(Userindex).Stats.Peso = UserList(Userindex).Stats.Peso - (UserList(Userindex).Invent.Object( _
                                                                           Slot).Amount * ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).Peso)

        'pluto:2.4.5
        If UserList(Userindex).Stats.Peso < 0.001 Then UserList(Userindex).Stats.Peso = 0

        UserList(Userindex).Invent.Object(Slot).Amount = 0
        UserList(Userindex).Invent.Object(Slot).ObjIndex = 0
        UserList(Userindex).Invent.NroItems = UserList(Userindex).Invent.NroItems - 1
        Call SendUserStatsPeso(Userindex)

    Case OBJTYPE_POCIONES

        'pluto:2.23
        If Not IntervaloPermiteTomar(Userindex) Then Exit Sub
        '---------------------
        'If UserList(UserIndex).flags.PuedeAtacar = 0 Then
        '  Call SendData(ToIndex, UserIndex, 0, "||¡¡Debes esperar unos momentos para tomar otra pocion!!" & FONTTYPENAMES.FONTTYPE_INFO)
        'Exit Sub
        'End If
        'pluto:2.10
        'If UserList(UserIndex).flags.PuedeTomar = 0 Then
        'Call SendData(ToIndex, UserIndex, 0, "||¡¡Debes esperar unos momentos para tomar otra pocion!!" & FONTTYPENAMES.FONTTYPE_INFO)
        'Exit Sub
        'End If

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        UserList(Userindex).flags.TomoPocion = True
        UserList(Userindex).flags.TipoPocion = obj.TipoPocion
        'pluto:2.10
        UserList(Userindex).flags.PuedeTomar = 0

        Select Case UserList(Userindex).flags.TipoPocion

        Case 1    'Modif la agilidad

            'pluto:7.0
            'If UserList(Userindex).raza = "Elfo Oscuro" Then
                'If Len(UserList(Userindex).Padre) = 0 Then
                 '   Call QuitarUserInvItem(Userindex, Slot, 1)
                  '  Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)
                   ' Call UpdateUserInv(False, Userindex, Slot)
                    'Exit Sub

                'End If

            'End If

            If UserList(Userindex).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, Userindex, 0, "S1")

            End If

            UserList(Userindex).flags.DuracionEfecto = obj.DuracionEfecto

            'Usa el item

            Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Agilidad), RandomNumber(obj.MinModificador, _
                                                                                          obj.MaxModificador), UserList(Userindex).Stats.UserAtributosBackUP(Agilidad) + 13)
            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)

        Case 2    'Modif la fuerza

            'pluto:7.0
            'If UserList(Userindex).raza = "Enano" Then
                'If Len(UserList(Userindex).Padre) = 0 Then
                 '   Call QuitarUserInvItem(Userindex, Slot, 1)
                  '  Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)
                   ' Call UpdateUserInv(False, Userindex, Slot)
                   ' Exit Sub

                'End If

            'End If

            If UserList(Userindex).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, Userindex, 0, "S1")

            End If

            UserList(Userindex).flags.DuracionEfecto = obj.DuracionEfecto
            'Usa el item
            Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Fuerza), RandomNumber(obj.MinModificador, _
                                                                                        obj.MaxModificador), UserList(Userindex).Stats.UserAtributosBackUP(Fuerza) + 13)

            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)

        Case 3    'Pocion roja, restaura HP

            'pluto:6.0A mas potencia pociones en los sin mana
            If UserList(Userindex).Stats.MaxMAN = 0 Then C = C + 10

            'pluto:7.0 pociones en humanos, nati: cambio de 10 a 5.
            'nati(18.06.11): veo algo ilógico que a una clase sin maná una poción roja pueda recuperarle lo de arriba + 5 extra.
            'If UserList(Userindex).raza = "Humano" And Not UserList(Userindex).Stats.MaxMAN = 0 Then C = C + 5

            AddtoVar UserList(Userindex).Stats.MinHP, obj.MaxModificador + C, UserList(Userindex).Stats.MaxHP

            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)

        Case 4    'Pocion azul, restaura MANA

            'Usa el item
            If ObjData(ObjIndex).MaxModificador < 270 Then

                'pluto:7.0 pociones en humanos
                'If UserList(Userindex).raza = "Humano" Then
                    'Call AddtoVar(UserList(Userindex).Stats.MinMAN, Porcentaje(UserList( _
                                                                               Userindex).Stats.MaxMAN, 7), UserList(Userindex).Stats.MaxMAN)
                'Else
                    Call AddtoVar(UserList(Userindex).Stats.MinMAN, Porcentaje(UserList( _
                                                                               Userindex).Stats.MaxMAN, 5), UserList(Userindex).Stats.MaxMAN)

                'End If

                'pluto: Pociones mejoradas
            Else

                'pluto:7.0 pociones en humanos
                'If UserList(Userindex).raza = "Humano" Then
                 '   Call AddtoVar(UserList(Userindex).Stats.MinMAN, Porcentaje(UserList( _
                                                                               Userindex).Stats.MaxMAN, 22), UserList(Userindex).Stats.MaxMAN)
                'Else
                    Call AddtoVar(UserList(Userindex).Stats.MinMAN, Porcentaje(UserList( _
                                                                               Userindex).Stats.MaxMAN, 20), UserList(Userindex).Stats.MaxMAN)

                'End If

            End If

            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)

        Case 5    ' Pocion violeta

            If UserList(Userindex).flags.Envenenado > 0 Then
                UserList(Userindex).flags.Envenenado = 0
                Call SendData(ToIndex, Userindex, 0, "||Te has curado del envenenamiento." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)

            End If

            'Añadimos esto para pocion paralisis

            'If UserList(UserIndex).Flags.Paralizado = 1 Then
            'UserList(UserIndex).Flags.Paralizado = 0
            'Call SendData(ToIndex, UserIndex, 0, "PARADOK")
            'Call SendData(ToIndex, UserIndex, 0, "||Te has quitado la paralisis." & FONTTYPENAMES.FONTTYPE_INFO)
            'End If

            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, Slot, 1)
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)

        Case 6    ' Ron para Pirata

            If (UCase$(UserList(Userindex).clase) = "PIRATA") Then

                'Fuerza
                If UserList(Userindex).flags.DuracionEfecto = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "S1")

                End If

                UserList(Userindex).flags.DuracionEfecto = 6000
                'Usa el item
                Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Fuerza), RandomNumber(1, 5), UserList( _
                                                                                                   Userindex).Stats.UserAtributosBackUP(Fuerza) + 13)

                'Agilidad
                If UserList(Userindex).flags.DuracionEfecto = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "S1")

                End If

                UserList(Userindex).flags.DuracionEfecto = 6000
                Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Agilidad), RandomNumber(1, 10), _
                              UserList(Userindex).Stats.UserAtributosBackUP(Agilidad) + 13)
                'Aumenta la energia

                UserList(Userindex).Counters.Ron = 500
                UserList(Userindex).flags.Ron = 10
                Call SendData(ToIndex, Userindex, 0, "S1")
                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList( _
                                                                                     Userindex).Char.CharIndex & "," & 3 & "," & 1)
                Call QuitarUserInvItem(Userindex, Slot, 1)
                Call UpdateUserInv(False, Userindex, Slot)
                Exit Sub

            End If

            Call QuitarUserInvItem(Userindex, Slot, 1)
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)

        End Select
        
    Case OBJTYPE_HUEVOS
     Dim tc As Integer
        If obj.GrhIndex = 12238 Or obj.GrhIndex = 12239 Or obj.GrhIndex = 12240 Or obj.GrhIndex = 12245 Or obj.GrhIndex = 12246 Or obj.GrhIndex = 12246 Or _
        obj.GrhIndex = 12247 Or obj.GrhIndex = 12248 Or obj.GrhIndex = 12249 Or obj.GrhIndex = 12250 Or obj.GrhIndex = 12251 Or obj.GrhIndex = 12252 Or obj.GrhIndex = 12253 Then
        
        If UserList(Userindex).Nmonturas > 2 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes tener más de 3 Mascotas." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If obj.GrhIndex = 12238 Then tc = 899
        If obj.GrhIndex = 12239 Then tc = 889
        If obj.GrhIndex = 12240 Then tc = 897
        If obj.GrhIndex = 12245 Then tc = 891
        If obj.GrhIndex = 12246 Then tc = 895
        If obj.GrhIndex = 12247 Then tc = 892
        If obj.GrhIndex = 12248 Then tc = 893
        If obj.GrhIndex = 12249 Then tc = 894
        If obj.GrhIndex = 12250 Then tc = 896
        If obj.GrhIndex = 12251 Then tc = 890
        If obj.GrhIndex = 12252 Then tc = 888
        If obj.GrhIndex = 12253 Then tc = 898
        
    Dim UserFile As String

    UserFile = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"

    
    
    
    Dim xx As Integer
    Dim X As Integer
    Dim Y As Integer
    Dim Expmascota As Integer
    

    
    MiObj.Amount = 1
    MiObj.ObjIndex = tc
    
    If TieneObjetos(tc, 1, Userindex) Then
        Call SendData(ToIndex, Userindex, 0, "||Ya tienes esa clase de mascota." & "´" & _
                                                         FontTypeNames.FONTTYPE_INFO)
        Exit Sub
        End If
        
    Call MeterItemEnInventario(Userindex, MiObj)
    
    xx = tc - 887
    
    X = RandomNumber(CInt(PMascotas(xx).VidaporLevel / 2), PMascotas(xx).VidaporLevel)
    Y = RandomNumber(CInt(PMascotas(xx).GolpeporLevel / 2), PMascotas(xx).GolpeporLevel)
    
    UserList(Userindex).Montura.Nivel(xx) = 1
    UserList(Userindex).Montura.exp(xx) = 0
    UserList(Userindex).Montura.Elu(xx) = PMascotas(xx).exp(1)
    UserList(Userindex).Montura.Vida(xx) = X
    UserList(Userindex).Montura.Golpe(xx) = Y
    UserList(Userindex).Montura.Nombre(xx) = PMascotas(xx).Tipo
    'pluto:6.0A
    UserList(Userindex).Montura.AtCuerpo(xx) = 1
    UserList(Userindex).Montura.Defcuerpo(xx) = 1
    UserList(Userindex).Montura.AtFlechas(xx) = 1
    UserList(Userindex).Montura.DefFlechas(xx) = 1
    UserList(Userindex).Montura.AtMagico(xx) = 1
    UserList(Userindex).Montura.DefMagico(xx) = 1
    UserList(Userindex).Montura.Evasion(xx) = 1
    
    'pluto:6.3
    If xx = 5 Then
        UserList(Userindex).Montura.Libres(xx) = UserList(Userindex).Montura.Libres(xx) + 4
    ElseIf xx = 6 Then
        UserList(Userindex).Montura.Libres(xx) = UserList(Userindex).Montura.Libres(xx) + 4
    Else
        UserList(Userindex).Montura.Libres(xx) = UserList(Userindex).Montura.Libres(xx) + 4

    End If

    'If xx <> 5 Then
    'UserList(UserIndex).Montura.Libres(xx) = 4
    'Else
    'UserList(UserIndex).Montura.Libres(xx) = 3
    'End If

    UserList(Userindex).Montura.Tipo(xx) = xx
    UserList(Userindex).Nmonturas = UserList(Userindex).Nmonturas + 1
    Dim xxx As Byte
    
    Dim n As Byte
    
    For n = 1 To 3

        If val(GetVar(UserFile, "MONTURA" & n, "TIPO")) = 0 Then
            xxx = n
            Exit For

        End If

    Next n

    Call WriteVar(UserFile, "MONTURAS", "NroMonturas", val(UserList(Userindex).Nmonturas))
    Call LogMascotas("Domar: " & UserList(Userindex).Name & " ahora tiene " & UserList(Userindex).Nmonturas & _
                     " la metemos en index " & xxx)

    Call WriteVar(UserFile, "MONTURA" & xxx, "NOMBRE", UserList(Userindex).Montura.Nombre(xx))
    Call WriteVar(UserFile, "MONTURA" & xxx, "NIVEL", val(UserList(Userindex).Montura.Nivel(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "EXP", val(UserList(Userindex).Montura.exp(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "ELU", val(UserList(Userindex).Montura.Elu(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "VIDA", val(UserList(Userindex).Montura.Vida(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "GOLPE", val(UserList(Userindex).Montura.Golpe(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "TIPO", val(UserList(Userindex).Montura.Tipo(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "ATCUERPO", val(UserList(Userindex).Montura.AtCuerpo(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "DEFCUERPO", val(UserList(Userindex).Montura.Defcuerpo(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "ATFLECHAS", val(UserList(Userindex).Montura.AtFlechas(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "DEFFLECHAS", val(UserList(Userindex).Montura.DefFlechas(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "ATMAGICO", val(UserList(Userindex).Montura.AtMagico(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "DEFMAGICO", val(UserList(Userindex).Montura.DefMagico(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "EVASION", val(UserList(Userindex).Montura.Evasion(xx)))
    Call WriteVar(UserFile, "MONTURA" & xxx, "LIBRES", val(UserList(Userindex).Montura.Libres(xx)))
    'pluto:6.0A
    UserList(Userindex).Montura.index(xx) = xxx
    
    Call QuitarUserInvItem(Userindex, Slot, 1)

       
        End If
        
    If obj.GrhIndex = 3286 Then
    If UserList(Userindex).flags.DragCredito1 = 1 Then Exit Sub
    UserList(Userindex).flags.DragCredito1 = 1
    Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3287 Then
    If UserList(Userindex).flags.DragCredito1 = 2 Then Exit Sub
    UserList(Userindex).flags.DragCredito1 = 2
    Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3288 Then
    If UserList(Userindex).flags.DragCredito1 = 3 Then Exit Sub
    UserList(Userindex).flags.DragCredito1 = 3
    Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3289 Then
    If UserList(Userindex).flags.DragCredito1 = 4 Then Exit Sub
    UserList(Userindex).flags.DragCredito1 = 4
    Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3290 Then
    If UserList(Userindex).flags.DragCredito1 = 5 Then Exit Sub
    UserList(Userindex).flags.DragCredito1 = 5
    Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3291 Then
    If UserList(Userindex).flags.DragCredito2 = 1 Then Exit Sub
    UserList(Userindex).flags.DragCredito2 = 1
    Call WriteVar(UserFile, "FLAGS", "DragC2", val(UserList(Userindex).flags.DragCredito2))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3292 Then
    If UserList(Userindex).flags.DragCredito2 = 2 Then Exit Sub
    UserList(Userindex).flags.DragCredito2 = 2
    Call WriteVar(UserFile, "FLAGS", "DragC2", val(UserList(Userindex).flags.DragCredito2))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3293 Then
    If UserList(Userindex).flags.DragCredito4 = 1 Then Exit Sub
    UserList(Userindex).flags.DragCredito4 = 1
    Call WriteVar(UserFile, "FLAGS", "DragC4", val(UserList(Userindex).flags.DragCredito4))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3294 Then
    If UserList(Userindex).flags.DragCredito4 = 2 Then Exit Sub
    UserList(Userindex).flags.DragCredito4 = 2
    Call WriteVar(UserFile, "FLAGS", "DragC4", val(UserList(Userindex).flags.DragCredito4))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3295 Then
    If UserList(Userindex).flags.DragCredito5 = 1 Then Exit Sub
    UserList(Userindex).flags.DragCredito5 = 1
    Call WriteVar(UserFile, "FLAGS", "DragC5", val(UserList(Userindex).flags.DragCredito5))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3296 Then
    If UserList(Userindex).flags.DragCredito6 = 1 Then Exit Sub
    UserList(Userindex).flags.DragCredito6 = 1
    Call WriteVar(UserFile, "FLAGS", "DragC6", val(UserList(Userindex).flags.DragCredito6))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3297 Then
    If UserList(Userindex).flags.DragCredito6 = 2 Then Exit Sub
    UserList(Userindex).flags.DragCredito6 = 2
    Call WriteVar(UserFile, "FLAGS", "DragC6", val(UserList(Userindex).flags.DragCredito6))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 3298 Then
    If UserList(Userindex).flags.DragCredito6 = 3 Then Exit Sub
    UserList(Userindex).flags.DragCredito6 = 3
    Call WriteVar(UserFile, "FLAGS", "DragC6", val(UserList(Userindex).flags.DragCredito6))
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    If obj.GrhIndex = 23525 Then
    MiObj.Amount = 1000
    MiObj.ObjIndex = 1500
    Call MeterItemEnInventario(Userindex, MiObj)
    Call QuitarUserInvItem(Userindex, Slot, 1)
    End If
    
    

    Case OBJTYPE_BEBIDA

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        AddtoVar UserList(Userindex).Stats.MinAGU, obj.MinSed, UserList(Userindex).Stats.MaxAGU
        UserList(Userindex).flags.Sed = 0
        Call EnviarHambreYsed(Userindex)

        'Quitamos del inv el item
        Call QuitarUserInvItem(Userindex, Slot, 1)

        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_BEBER)

    Case OBJTYPE_LLAVES

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If UserList(Userindex).flags.TargetObj = 0 Then Exit Sub
        TargObj = ObjData(UserList(Userindex).flags.TargetObj)

        '¿El objeto clickeado es una puerta?
        If TargObj.OBJType = OBJTYPE_PUERTAS Then

            '¿Esta cerrada?
            If TargObj.Cerrada = 1 Then

                '¿Cerrada con llave?
                If TargObj.Llave > 0 Then
                    If TargObj.Clave = obj.Clave Then

                        MapData(UserList(Userindex).flags.TargetObjMap, UserList(Userindex).flags.TargetObjX, _
                                UserList(Userindex).flags.TargetObjY).OBJInfo.ObjIndex = ObjData(MapData(UserList( _
                                                                                                         Userindex).flags.TargetObjMap, UserList(Userindex).flags.TargetObjX, UserList( _
                                                                                                                                                                              Userindex).flags.TargetObjY).OBJInfo.ObjIndex).IndexCerrada
                        UserList(Userindex).flags.TargetObj = MapData(UserList(Userindex).flags.TargetObjMap, _
                                                                      UserList(Userindex).flags.TargetObjX, UserList( _
                                                                                                            Userindex).flags.TargetObjY).OBJInfo.ObjIndex
                        Call SendData(ToIndex, Userindex, 0, "||Has abierto la puerta." & "´" & _
                                                             FontTypeNames.FONTTYPE_INFO)
                        Exit Sub
                    Else
                        Call SendData(ToIndex, Userindex, 0, "||La llave no sirve." & "´" & _
                                                             FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                Else

                    If TargObj.Clave = obj.Clave Then
                        MapData(UserList(Userindex).flags.TargetObjMap, UserList(Userindex).flags.TargetObjX, _
                                UserList(Userindex).flags.TargetObjY).OBJInfo.ObjIndex = ObjData(MapData(UserList( _
                                                                                                         Userindex).flags.TargetObjMap, UserList(Userindex).flags.TargetObjX, UserList( _
                                                                                                                                                                              Userindex).flags.TargetObjY).OBJInfo.ObjIndex).IndexCerradaLlave
                        Call SendData(ToIndex, Userindex, 0, "||Has cerrado con llave la puerta." & "´" & _
                                                             FontTypeNames.FONTTYPE_INFO)
                        UserList(Userindex).flags.TargetObj = MapData(UserList(Userindex).flags.TargetObjMap, _
                                                                      UserList(Userindex).flags.TargetObjX, UserList( _
                                                                                                            Userindex).flags.TargetObjY).OBJInfo.ObjIndex
                        Exit Sub
                    Else
                        Call SendData(ToIndex, Userindex, 0, "||La llave no sirve." & "´" & _
                                                             FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                End If

            Else
                Call SendData(ToIndex, Userindex, 0, "||No esta cerrada." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

        End If

    Case OBJTYPE_BOTELLAVACIA

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If Not HayAgua(UserList(Userindex).Pos.Map, UserList(Userindex).flags.TargetX, UserList( _
                                                                                       Userindex).flags.TargetY) Then
            Call SendData(ToIndex, Userindex, 0, "||No hay agua allí." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        MiObj.Amount = 1
        MiObj.ObjIndex = ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).IndexAbierta
        Call QuitarUserInvItem(Userindex, Slot, 1)

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            '    Call TirarItemAlPiso(UserList(UserIndex).Pos, MiObj)
            Call SendData(ToIndex, Userindex, 0, "||Inventario Lleno." & "´" & FontTypeNames.FONTTYPE_INFO)

        End If

    Case OBJTYPE_BOTELLALLENA

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        AddtoVar UserList(Userindex).Stats.MinAGU, obj.MinSed, UserList(Userindex).Stats.MaxAGU
        UserList(Userindex).flags.Sed = 0
        Call EnviarHambreYsed(Userindex)
        MiObj.Amount = 1
        MiObj.ObjIndex = ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).IndexCerrada
        Call QuitarUserInvItem(Userindex, Slot, 1)

        'If Not MeterItemEnInventario(UserIndex, MiObj) Then
        '   Call TirarItemAlPiso(UserList(UserIndex).Pos, MiObj)
        'End If
        'pluto:2.17
        If MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList( _
                                                                           Userindex).Pos.Y).OBJInfo.ObjIndex > 0 Then

            If ObjData(MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList( _
                                                                                       Userindex).Pos.Y).OBJInfo.ObjIndex).OBJType = 15 Then
                Call EraseObj(ToMap, Userindex, UserList(Userindex).Pos.Map, 1, UserList(Userindex).Pos.Map, _
                              UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)
                Call SubirSkill(Userindex, Supervivencia)

            End If

        End If
        

    Case OBJTYPE_HERRAMIENTAS

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If Not UserList(Userindex).Stats.MinSta > 0 Then
            Call SendData(ToIndex, Userindex, 0, "L7")
            Exit Sub

        End If

        If UserList(Userindex).Invent.Object(Slot).Equipped = 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Antes de usar la herramienta deberias equipartela." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        Call AddtoVar(UserList(Userindex).Reputacion.PlebeRep, vlProleta, MAXREP)

        Select Case ObjIndex

        Case OBJTYPE_CAÑA
            Call SendData2(ToIndex, Userindex, 0, 31, Pesca)

        Case 543
            Call SendData2(ToIndex, Userindex, 0, 31, Pesca)

        Case HACHA_LEÑADOR
            Call SendData2(ToIndex, Userindex, 0, 31, Talar)

        Case PIQUETE_MINERO
            Call SendData2(ToIndex, Userindex, 0, 31, Mineria)

        Case MARTILLO_HERRERO

            If (UCase$(UserList(Userindex).clase) <> "HERRERO") Then
                Call SendData(ToIndex, Userindex, 0, "||Sólo los Herreros pueden usar estos objetos." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            Call SendData2(ToIndex, Userindex, 0, 31, Herreria)

        Case SERRUCHO_CARPINTERO

            If (UCase$(UserList(Userindex).clase) <> "CARPINTERO") Then
                Call SendData(ToIndex, Userindex, 0, "||Sólo los Carpinteros pueden usar estos objetos." & _
                                                     "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            Call EnivarObjConstruibles(Userindex)
            Call SendData2(ToIndex, Userindex, 0, 13)

            '[MerLiNz:6]
        Case SERRUCHOMAGICO_ermitano

            If (UCase$(UserList(Userindex).clase) <> "ERMITAÑO") Then
                Call SendData(ToIndex, Userindex, 0, "||Solo los ermitaños pueden usar estos objetos. " & "´" _
                                                     & FontTypeNames.FONTTYPE_INFO)
            Else
                Call EnviarObjMagicosConstruibles(Userindex)
                Call SendData2(ToIndex, Userindex, 0, 13)

            End If

            '[\END]
        End Select

    Case OBJTYPE_PERGAMINOS

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'pluto:6.0A
        If ClasePuedeUsarItem(Userindex, UserList(Userindex).Invent.Object(Slot).ObjIndex) = False Then
            Call SendData(ToIndex, Userindex, 0, "||El " & UserList(Userindex).clase & _
                                                 " no puede usar este hechizo." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UserList(Userindex).flags.Hambre = 0 And UserList(Userindex).flags.Sed = 0 Then
            Call AgregarHechizo(Userindex, Slot)

        Else
            Call SendData(ToIndex, Userindex, 0, "||Estas demasiado hambriento y sediento." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If

    Case OBJTYPE_MINERALES

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        Call SendData2(ToIndex, Userindex, 0, 31, FundirMetal)

    Case OBJTYPE_INSTRUMENTOS

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'pluto:2.12
        If UserList(Userindex).flags.Privilegios > 0 Then
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & obj.Snd1)

        End If

        If UCase$(UserList(Userindex).clase) = "BARDO" Then
            If UserList(Userindex).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, Userindex, 0, "S1")

            End If

            UserList(Userindex).flags.DuracionEfecto = 2000
            'Usa el item
            UserList(Userindex).flags.TomoPocion = True
            Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Agilidad), RandomNumber(1, 5), MAXATRIBUTOS)
            Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Fuerza), RandomNumber(1, 5), MAXATRIBUTOS)
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & obj.Snd1)
            'pluto:2.12
        Else
            Call SendData(ToIndex, Userindex, 0, "||Sólo para Bardos." & "´" & FontTypeNames.FONTTYPE_INFO)

        End If

    Case OBJTYPE_BARCOS
        UserList(Userindex).Invent.BarcoObjIndex = UserList(Userindex).Invent.Object(Slot).ObjIndex
        UserList(Userindex).Invent.BarcoSlot = Slot

        'pluto:2.3
        Dim Pos As WorldPos

        'pluto:2.4 añado el or para poder quitarlo en tierra
        If HayAguaCerca(UserList(Userindex).Pos) Or UserList(Userindex).flags.Navegando = 1 Then
            Call DoNavega(Userindex, obj)

        Else
            Call SendData(ToIndex, Userindex, 0, "||No puedes usar el barco en tierra." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If

        'pluto:2.3
    Case OBJTYPE_Montura

        Call UsaMontura(Userindex, obj)

        If UserList(Userindex).flags.Montura = 1 Then
            UserList(Userindex).flags.ClaseMontura = ObjData(UserList(Userindex).Invent.Object( _
                                                             Slot).ObjIndex).SubTipo
        Else
            UserList(Userindex).flags.ClaseMontura = 0

        End If

    End Select

    'Actualiza
    Call senduserstatsbox(Userindex)
    'Call UpdateUserInv(True, userindex, 0)
    'pluto:2.4
    Call UpdateUserInv(False, Userindex, Slot)

    Exit Sub
fallo:
    Call LogError("USEINVITEM " & obj.Name & "->" & UserList(Userindex).Name & " D: " & Err.Description)

End Sub

'[MerLiNz:6]
Sub EnviarObjMagicosConstruibles(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim i As Integer, cad$
    Dim n As Byte
    n = 0

    For i = 1 To UBound(Objermitano)

        If (ObjData(Objermitano(i)).SkCarpinteria <= UserList(Userindex).Stats.UserSkills(Carpinteria) / _
            ModCarpinteria(UserList(Userindex).clase)) And (ObjData(Objermitano(i)).SkHerreria <= UserList( _
                                                            Userindex).Stats.UserSkills(Herreria) / ModHerreriA(UserList(Userindex).clase)) Then
            'cad$ = cad$ & ObjData(Objermitano(i)).Name & " (" & ObjData(Objermitano(i)).Madera & ":M) " & "(" & ObjData(Objermitano(i)).LingO & ":LO)" & "(" & ObjData(Objermitano(i)).LingP & ":LP)" & "(" & ObjData(Objermitano(i)).Gemas & ":G)" & "(" & ObjData(Objermitano(i)).Diamantes & ":D)" & "," & Objermitano(i) & ","
            n = n + 1
            cad$ = cad$ & Objermitano(i) & ","

        End If

    Next i

    Call SendData2(ToIndex, Userindex, 0, 40, n + 1 & "," & cad$)
    '[\END]
    Exit Sub
fallo:
    Call LogError("ENVIAROBJMAGICOSCONTRUIBLES " & Err.number & " D: " & Err.Description)

End Sub

Sub EnivarArmasConstruibles(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim i As Integer, cad$
    Dim n As Byte

    For i = 1 To UBound(ArmasHerrero)

        If ObjData(ArmasHerrero(i)).SkHerreria <= UserList(Userindex).Stats.UserSkills(Herreria) \ ModHerreriA( _
           UserList(Userindex).clase) Then

            'añado type=32 para municiones
            If ObjData(ArmasHerrero(i)).OBJType = OBJTYPE_WEAPON Or ObjData(ArmasHerrero(i)).OBJType = 32 Or ObjData( _
               ArmasHerrero(i)).OBJType = 18 Then
                'cad$ = cad$ & ObjData(ArmasHerrero(i)).name & " (" & ObjData(ArmasHerrero(i)).MinHIT & "/" & ObjData(ArmasHerrero(i)).MaxHIT & ")" & "," & ArmasHerrero(i) & ","
                n = n + 1
                cad$ = cad$ & ArmasHerrero(i) & ","

                'Else
                'cad$ = cad$ & ObjData(ArmasHerrero(i)).Name & "," & ArmasHerrero(i) & ","
            End If

        End If

    Next i

    Call SendData2(ToIndex, Userindex, 0, 37, n + 1 & "," & cad$)

    Exit Sub
fallo:
    Call LogError("ENVIARARMASCONSTRUIBLES " & Err.number & " D: " & Err.Description)

End Sub

Sub EnivarObjConstruibles(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim i As Integer, cad$
    Dim n As Byte
    n = 0

    For i = 1 To UBound(ObjCarpintero)

        If ObjData(ObjCarpintero(i)).SkCarpinteria <= UserList(Userindex).Stats.UserSkills(Carpinteria) / _
           ModCarpinteria(UserList(Userindex).clase) Then
            n = n + 1
            cad$ = cad$ & ObjCarpintero(i) & ","

        End If

    Next i

    Call SendData2(ToIndex, Userindex, 0, 39, n + 1 & "," & cad$)
    Exit Sub
fallo:
    Call LogError("ENVIAROBJCONSTRUIBLES " & Err.number & " D: " & Err.Description)

End Sub

Sub EnivarArmadurasConstruibles(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim i As Integer, cad$
    Dim n As Byte
    n = 0

    For i = 1 To UBound(ArmadurasHerrero)

        If ObjData(ArmadurasHerrero(i)).SkHerreria <= UserList(Userindex).Stats.UserSkills(Herreria) / ModHerreriA( _
           UserList(Userindex).clase) Then
            n = n + 1
            cad$ = cad$ & ArmadurasHerrero(i) & ","

        End If

    Next i

    Call SendData2(ToIndex, Userindex, 0, 38, n + 1 & "," & cad$)
    Exit Sub
fallo:
    Call LogError("ENVIARARMADURASCONSTRUIBLES " & Err.number & " D: " & Err.Description)

End Sub

Sub TirarTodo(ByVal Userindex As Integer)

    On Error GoTo fallo

    'PLUTO:6.7 AÑADO MAPA TORNEO TODOSVSTODOS Y SALAS CLAN
        If UserList(Userindex).Pos.Map = 191 Or UserList(Userindex).Pos.Map = 293 Or UserList(Userindex).Pos.Map = 164 Or UserList(Userindex).Pos.Map = 203 Or UserList(Userindex).Pos.Map = 204 Or UserList(Userindex).Pos.Map = 205 Or UserList(Userindex).Pos.Map = 206 Or UserList(Userindex).Pos.Map = 207 Or UserList(Userindex).Pos.Map = 208 Or UserList(Userindex).Pos.Map = _
       MapaTorneo2 Or UCase$(MapInfo(UserList(Userindex).Pos.Map).Terreno) = "CLANATACA" Or UCase$(MapInfo(UserList(Userindex).Pos.Map).Terreno) = "TORNEO" Or UCase$(MapInfo(UserList(Userindex).Pos.Map).Terreno) = "EVENTO" Then Exit Sub
    'If UserList(Userindex).Pos.Map = 191 Or UserList(Userindex).Pos.Map = 293 Or UserList(Userindex).Pos.Map = _
       MapaTorneo2 Or UCase$(MapInfo(UserList(Userindex).Pos.Map).Terreno) = "CLANATACA" Then Exit Sub
       
           'IRON AO: AMULETO SACRIFICIO
    If TieneObjetos(1385, 1, Userindex) Then
        Call QuitarObjetos(1385, 1, Userindex)
        Call SendData(ToIndex, Userindex, 0, "||Sacrificaste un pendiente de sacrificio, en cambio tus items se conservan" & "´" & FontTypeNames.FONTTYPE_INFO)    'Juance!
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & FXSACRI & "," & 0)
        Exit Sub
    End If

    If UserList(Userindex).flags.Privilegios > 0 Then Exit Sub
    Call TirarTodosLosItems(Userindex)

    
    Exit Sub
fallo:
    Call LogError("TIRAR TODO " & Err.number & " D: " & Err.Description)

End Sub

Public Function ItemSeCae(ByVal index As Integer) As Boolean

    On Error GoTo fallo

    'pluto:2.18
    If index = 1018 Or index = 1019 Then ItemSeCae = True: Exit Function

    ItemSeCae = ObjData(index).Real <> 1 And ObjData(index).nocaer <> 1 And ObjData(index).Caos <> 1 And ObjData( _
                index).OBJType <> OBJTYPE_LLAVES And ObjData(index).OBJType <> OBJTYPE_BARCOS

    Exit Function
fallo:
    Call LogError("ITEMSECAE " & Err.number & " D: " & Err.Description)

End Function

Sub TirarTodosLosItems(ByVal Userindex As Integer)

    On Error GoTo fallo

    'PLUTO:2.4.2
    If UserList(Userindex).Pos.Map = 191 Or UserList(Userindex).Pos.Map = 293 Or UserList(Userindex).Pos.Map = 164 Or UserList(Userindex).Pos.Map = 203 Or UserList(Userindex).Pos.Map = 204 Or UserList(Userindex).Pos.Map = 205 Or UserList(Userindex).Pos.Map = 206 Or UserList(Userindex).Pos.Map = 207 Or UserList(Userindex).Pos.Map = 208 Or UserList(Userindex).Pos.Map = _
       MapaTorneo2 Then Exit Sub

    'Call LogTarea("Sub TirarTodosLosItems")

    Dim i As Byte
    Dim NuevaPos As WorldPos
    Dim MiObj As obj
    Dim itemIndex As Integer

    For i = 1 To MAX_INVENTORY_SLOTS

        itemIndex = UserList(Userindex).Invent.Object(i).ObjIndex

        If itemIndex > 0 Then
            If ItemSeCae(itemIndex) Then
                NuevaPos.X = 0
                NuevaPos.Y = 0
                Tilelibre UserList(Userindex).Pos, NuevaPos

                If NuevaPos.X <> 0 And NuevaPos.Y <> 0 Then
                    If MapData(NuevaPos.Map, NuevaPos.X, NuevaPos.Y).OBJInfo.ObjIndex = 0 Then Call DropObj( _
                       Userindex, i, MAX_INVENTORY_OBJS, NuevaPos.Map, NuevaPos.X, NuevaPos.Y)

                End If

            End If

        End If

    Next i

    Exit Sub
fallo:
    Call LogError("TIRAR TODOS LOS ITEMS " & Err.number & " D: " & Err.Description)

End Sub

Function ItemNewbie(ByVal itemIndex As Integer) As Boolean

    On Error GoTo fallo

    ItemNewbie = ObjData(itemIndex).Newbie = 1
    Exit Function
fallo:
    Call LogError("ITEMNEWBIE " & Err.number & " D: " & Err.Description)

End Function

Sub TirarTodosLosItemsNoNewbies(ByVal Userindex As Integer)

    On Error GoTo fallo

    'PLUTO:2.4.2
    If UserList(Userindex).Pos.Map = 191 Or UserList(Userindex).Pos.Map = 293 Or UserList(Userindex).Pos.Map = 164 Or UserList(Userindex).Pos.Map = 203 Or UserList(Userindex).Pos.Map = 204 Or UserList(Userindex).Pos.Map = 205 Or UserList(Userindex).Pos.Map = 206 Or UserList(Userindex).Pos.Map = 207 Or UserList(Userindex).Pos.Map = 208 Or UserList(Userindex).Pos.Map = _
       MapaTorneo2 Then Exit Sub

    Dim i As Byte
    Dim NuevaPos As WorldPos
    Dim MiObj As obj
    Dim itemIndex As Integer

    'pluto:2-3-04
    If UserList(Userindex).flags.Privilegios > 0 Then Exit Sub

    For i = 1 To MAX_INVENTORY_SLOTS
        itemIndex = UserList(Userindex).Invent.Object(i).ObjIndex

        If itemIndex > 0 Then
            If ItemSeCae(itemIndex) And Not ItemNewbie(itemIndex) Then
                NuevaPos.X = 0
                NuevaPos.Y = 0
                Tilelibre UserList(Userindex).Pos, NuevaPos

                If NuevaPos.X <> 0 And NuevaPos.Y <> 0 Then
                    If MapData(NuevaPos.Map, NuevaPos.X, NuevaPos.Y).OBJInfo.ObjIndex = 0 Then Call DropObj( _
                       Userindex, i, MAX_INVENTORY_OBJS, NuevaPos.Map, NuevaPos.X, NuevaPos.Y)

                End If

            End If

        End If

    Next i

    Exit Sub
fallo:
    Call LogError("TIRARTODOSLOSITEMSNEWBIES " & Err.number & " D: " & Err.Description)

End Sub

