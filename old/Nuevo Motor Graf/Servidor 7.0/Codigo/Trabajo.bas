Attribute VB_Name = "Trabajo"
Option Explicit

Public Sub DoPermanecerOculto(ByVal Userindex As Integer)

    On Error GoTo errhandler

    Dim suerte As Integer
    Dim res As Integer

    If UserList(Userindex).Stats.UserSkills(Ocultarse) <= 20 And UserList(Userindex).Stats.UserSkills(Ocultarse) >= _
       -1 Then
        suerte = 135
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 40 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 21 Then
        suerte = 130
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 60 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 41 Then
        suerte = 128
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 80 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 61 Then
        suerte = 124
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 100 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 81 Then
        suerte = 122
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 120 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 101 Then
        suerte = 120
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 140 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 121 Then
        suerte = 118
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 160 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 141 Then
        suerte = 116
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 180 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 161 Then
        suerte = 113
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 200 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 181 Then
        suerte = 110

    End If

    If UserList(Userindex).Stats.UserSkills(Ocultarse) = 200 Then suerte = 107

    If UCase$(UserList(Userindex).clase) <> "LADRON" Then suerte = suerte + 10

    res = RandomNumber(1, suerte)
    
    If UserList(Userindex).Pos.Map > 199 And UserList(Userindex).Pos.Map < 212 Then Exit Sub

    If res > 103 Then
        UserList(Userindex).flags.Oculto = 0
        UserList(Userindex).flags.Invisible = 0
        UserList(Userindex).Counters.Invisibilidad = 0
        Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 16, UserList(Userindex).Char.CharIndex & ",0")
        Call SendData(ToIndex, Userindex, 0, "E3")

    End If

    Exit Sub

errhandler:
    Call LogError("Error en Sub DoPermanecerOculto")

End Sub

Public Sub DoOcultarse(ByVal Userindex As Integer)

    On Error GoTo errhandler

    If MapInfo(UserList(Userindex).Pos.Map).Pk = False Then
        Exit Sub

    End If

    Dim suerte As Integer
    Dim res As Integer

    If UserList(Userindex).Stats.UserSkills(Ocultarse) <= 20 And UserList(Userindex).Stats.UserSkills(Ocultarse) >= _
       -1 Then
        suerte = 35
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 40 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 21 Then
        suerte = 30
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 60 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 41 Then
        suerte = 28
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 80 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 61 Then
        suerte = 24
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 100 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 81 Then
        suerte = 22
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 120 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 101 Then
        suerte = 20
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 140 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 121 Then
        suerte = 18
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 160 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 141 Then
        suerte = 15
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 180 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 161 Then
        suerte = 12
    ElseIf UserList(Userindex).Stats.UserSkills(Ocultarse) <= 200 And UserList(Userindex).Stats.UserSkills(Ocultarse) _
           >= 181 Then
        suerte = 9

    End If

    If UserList(Userindex).Stats.UserSkills(Ocultarse) = 200 Then suerte = 7
    If UCase$(UserList(Userindex).clase) <> "LADRON" Then suerte = suerte + 30

    res = RandomNumber(1, suerte)
    
    If UserList(Userindex).Pos.Map > 199 And UserList(Userindex).Pos.Map < 212 Then Exit Sub

    If res <= 5 Then
        UserList(Userindex).flags.Oculto = 1
        UserList(Userindex).flags.Invisible = 1
        Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 16, UserList(Userindex).Char.CharIndex & ",1")
        Call SendData(ToIndex, Userindex, 0, "E4")
        Call SubirSkill(Userindex, Ocultarse)

    End If

    Exit Sub

errhandler:
    Call LogError("Error en Sub DoOcultarse")

End Sub

Public Sub DoNavega(ByVal Userindex As Integer, ByRef Barco As ObjData)

    On Error GoTo fallo

    Dim X As Integer
    Dim Y As Integer

    With UserList(Userindex)

        'PLUTO:2.4
        If .flags.Montura > 0 Or .flags.Angel > 0 Or .flags.Morph > 0 Or .flags.Demonio > 0 Then Exit Sub

        Dim ModNave As Long
        ModNave = ModNavegacion(.clase)

        If .Stats.UserSkills(Navegacion) / ModNave < Barco.MinSkill Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes conocimientos para usar este barco." & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Para usar este barco necesitas " & Barco.MinSkill * ModNave & " puntos en navegacion." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If .flags.Navegando = 0 Then

            .Char.Head = 0

            If .flags.Muerto = 0 Then
                .Char.Body = Barco.Ropaje
            Else
                .Char.Body = iFragataFantasmal

            End If

            .Char.ShieldAnim = NingunEscudo
            .Char.WeaponAnim = NingunArma
            .Char.CascoAnim = NingunCasco
            .Char.Botas = NingunBota
            .Char.AlasAnim = NingunAla

            .flags.Navegando = 1

            'pluto:6.0A------------
            If .Invent.BarcoObjIndex = 474 Then
                .Stats.PesoMax = .Stats.PesoMax + 100
            ElseIf .Invent.BarcoObjIndex = 475 Then
                .Stats.PesoMax = .Stats.PesoMax + 300
            ElseIf .Invent.BarcoObjIndex = 476 Then
                .Stats.PesoMax = .Stats.PesoMax + 500

            End If

            '-----------------------
        Else

            'PLUTO:2.4
            If HayAgua(.Pos.Map, .Pos.X + 1, .Pos.Y) And HayAgua(.Pos.Map, .Pos.X, .Pos.Y + 1) And HayAgua(.Pos.Map, .Pos.X, .Pos.Y - 1) And HayAgua(.Pos.Map, .Pos.X - 1, .Pos.Y) Then
                Call SendData(ToIndex, Userindex, 0, "||No Puedes bajar del barco." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            .flags.Navegando = 0

            'pluto:6.0A------------
            If .Invent.BarcoObjIndex = 474 Then
                .Stats.PesoMax = .Stats.PesoMax - 100
            ElseIf .Invent.BarcoObjIndex = 475 Then
                .Stats.PesoMax = .Stats.PesoMax - 300
            ElseIf .Invent.BarcoObjIndex = 476 Then
                .Stats.PesoMax = .Stats.PesoMax - 500

            End If

            '-----------------------

            If .flags.Muerto = 0 Then
                .Char.Head = .OrigChar.Head

                If .Invent.ArmourEqpObjIndex > 0 Then
                    .Char.Body = ObjData(.Invent.ArmourEqpObjIndex).Ropaje
                Else
                    Call DarCuerpoDesnudo(Userindex)

                End If

                If .Invent.EscudoEqpObjIndex > 0 Then .Char.ShieldAnim = ObjData(.Invent.EscudoEqpObjIndex).ShieldAnim

                If .Invent.WeaponEqpObjIndex > 0 Then .Char.WeaponAnim = ObjData(.Invent.WeaponEqpObjIndex).WeaponAnim

                If .Invent.CascoEqpObjIndex > 0 Then .Char.CascoAnim = ObjData(.Invent.CascoEqpObjIndex).CascoAnim

                If .Invent.BotaEqpObjIndex > 0 Then .Char.Botas = ObjData(.Invent.BotaEqpObjIndex).Botas

                If .Invent.AlaEqpObjIndex > 0 Then .Char.AlasAnim = ObjData(.Invent.AlaEqpObjIndex).AlasAnim
                '[GAU]

            Else

                If Not Criminal(Userindex) Then
                    .Char.Body = iCuerpoMuerto
                    .Char.Head = iCabezaMuerto
                Else
                    .Char.Body = iCuerpoMuerto2
                    .Char.Head = iCabezaMuerto2

                End If
          
                .Char.ShieldAnim = NingunEscudo
                .Char.WeaponAnim = NingunArma
                .Char.CascoAnim = NingunCasco
                .Char.AlasAnim = NingunAla
                .Char.Botas = NingunBota

            End If

        End If

        '[GAU] Agregamo .Char.Botas
        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
        Call SendData2(ToIndex, Userindex, 0, 6)
        'pluto:6.0A------------------------
        Call SendUserStatsPeso(Userindex)
        '-----------------------------------
    
    End With

    Exit Sub
fallo:
    Call LogError("donavega " & Err.number & " D: " & Err.Description)

End Sub

Public Sub FundirMineral(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).flags.TargetObjInvIndex > 0 Then

        'pluto:2.14
        If ObjData(UserList(Userindex).flags.TargetObjInvIndex).OBJType <> 23 Then

            'PLUTO:6.3---------------
            If UserList(Userindex).flags.Macreanda > 0 Then
                UserList(Userindex).flags.ComproMacro = 0
                UserList(Userindex).flags.Macreanda = 0
                Call SendData(ToIndex, Userindex, 0, "O3")

            End If

            '--------------------------
            'Call LogError(" en Jugador:" & UserList(UserIndex).Name & " Bug Fundir " & "Ip: " & UserList(UserIndex).ip & "HD: " & UserList(UserIndex).Serie & " Objeto: " & UserList(UserIndex).flags.TargetObjInvIndex)
            'pluto:2.18-------------------
            'Dim Tindex As Integer
            'Tindex = NameIndex("AoDraGBoT")
            'If Tindex <= 0 Then Exit Sub
            'Call SendData(ToIndex, Tindex, 0, "|| Jugador: " & UserList(UserIndex).Name & " -> Bug Fundir metal." & "´" & FontTypeNames.FONTTYPE_talk)
            '--------------------------

            'CloseUser (UserIndex)
            Exit Sub

        End If

        '-------------

        If ObjData(UserList(Userindex).flags.TargetObjInvIndex).MinSkill <= UserList(Userindex).Stats.UserSkills( _
           Mineria) / ModFundicion(UserList(Userindex).clase) Then
            Call DoLingotes(Userindex)
        Else
            Call SendData(ToIndex, Userindex, 0, _
                          "||No tenes conocimientos de mineria suficientes para trabajar este mineral." & "´" & _
                          FontTypeNames.FONTTYPE_INFO)

        End If

    End If

    Exit Sub
fallo:
    Call LogError("fundirmineral " & Err.number & " D: " & Err.Description)

End Sub

Function TieneObjetos(ByVal itemIndex As Integer, _
                      ByVal Cant As Integer, _
                      ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    Dim i As Integer
    Dim total As Long

    For i = 1 To MAX_INVENTORY_SLOTS

        If UserList(Userindex).Invent.Object(i).ObjIndex = itemIndex Then
            total = total + UserList(Userindex).Invent.Object(i).Amount

        End If

    Next i

    If Cant <= total Then
        TieneObjetos = True
        Exit Function

    End If

    'pluto:2.10
    TieneObjetos = False
    Exit Function
fallo:
    Call LogError("tieneobjetos " & Err.number & " D: " & Err.Description)

End Function

Function QuitarObjetos(ByVal itemIndex As Integer, _
                       ByVal Cant As Integer, _
                       ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    Dim i As Integer

    For i = 1 To MAX_INVENTORY_SLOTS

        If UserList(Userindex).Invent.Object(i).ObjIndex = itemIndex Then

            'pluto:6.0A quito weaponindex=1 no entiendo pq estaba...(lo pongo pq da error al remortear el desequipar recupera atributos bases)
            If UserList(Userindex).Invent.WeaponEqpObjIndex = 1 Then Call Desequipar(Userindex, i)
            'Call Desequipar(UserIndex, i)

            UserList(Userindex).Invent.Object(i).Amount = UserList(Userindex).Invent.Object(i).Amount - Cant
            'pluto:2.4
            UserList(Userindex).Stats.Peso = UserList(Userindex).Stats.Peso - (ObjData(UserList( _
                                                                                       Userindex).Invent.Object(i).ObjIndex).Peso * Cant)

            'pluto:2.4.5
            If UserList(Userindex).Stats.Peso < 0.001 Then UserList(Userindex).Stats.Peso = 0

            Call SendUserStatsPeso(Userindex)

            Cant = Abs(UserList(Userindex).Invent.Object(i).Amount)

            'pluto:2-3-04
            If UserList(Userindex).Invent.Object(i).Amount > 0 Then
                Call UpdateUserInv(False, Userindex, i)
                Exit Function

            End If

            If UserList(Userindex).Invent.Object(i).Amount = 0 Then
                UserList(Userindex).Invent.Object(i).Amount = 0
                UserList(Userindex).Invent.Object(i).ObjIndex = 0
                QuitarObjetos = True
                'pluto:hoy
                Call UpdateUserInv(False, Userindex, i)

                Exit Function

            End If

            If UserList(Userindex).Invent.Object(i).Amount < 1 Then
                UserList(Userindex).Invent.Object(i).Amount = 0
                UserList(Userindex).Invent.Object(i).ObjIndex = 0

            End If

            Call UpdateUserInv(False, Userindex, i)

        End If

    Next i

    Exit Function
fallo:
    Call LogError("quitarobjetos " & Err.number & " D: " & Err.Description)

End Function

Sub HerreroQuitarMateriales(ByVal Userindex As Integer, ByVal itemIndex As Integer)

    On Error GoTo fallo

    If ObjData(itemIndex).LingH > 0 Then Call QuitarObjetos(LingoteHierro, ObjData(itemIndex).LingH, Userindex)
    If ObjData(itemIndex).LingP > 0 Then Call QuitarObjetos(LingotePlata, ObjData(itemIndex).LingP, Userindex)
    If ObjData(itemIndex).LingO > 0 Then Call QuitarObjetos(LingoteOro, ObjData(itemIndex).LingO, Userindex)

    'pluto:2.10
    If ObjData(itemIndex).LingH < 1 And ObjData(itemIndex).LingP < 1 And ObjData(itemIndex).LingO < 1 Then
        Call LogCasino("Jugador:" & UserList(Userindex).Name & "Herrero materiales cero (c) OBJ: " & itemIndex & _
                       "Ip: " & UserList(Userindex).ip)
        Exit Sub

    End If

    Exit Sub
fallo:
    Call LogError("herreroquitarmateriales " & Err.number & " D: " & Err.Description)

End Sub

Sub CarpinteroQuitarMateriales(ByVal Userindex As Integer, ByVal itemIndex As Integer)

    On Error GoTo fallo

    If ObjData(itemIndex).Madera > 0 Then Call QuitarObjetos(Leña, ObjData(itemIndex).Madera, Userindex)

    'pluto:2.10
    If ObjData(itemIndex).Madera < 1 Then
        Call LogCasino("Jugador:" & UserList(Userindex).Name & "Carpinterp materiales cero(c) OBJ: " & itemIndex & _
                       "Ip: " & UserList(Userindex).ip)
        Exit Sub

    End If

    Exit Sub
fallo:
    Call LogError("carpinteroquitarmateriales " & Err.number & " D: " & Err.Description)

End Sub

'[MerLiNz:6]
Sub ermitanoQuitarMateriales(ByVal Userindex As Integer, ByVal itemIndex As Integer)

    On Error GoTo fallo

    If ObjData(itemIndex).Madera > 0 Then Call QuitarObjetos(Leña, ObjData(itemIndex).Madera, Userindex)

    'pluto:2.4.5
    If ObjData(itemIndex).LingH > 0 Then Call QuitarObjetos(LingoteHierro, ObjData(itemIndex).LingH, Userindex)

    If ObjData(itemIndex).LingO > 0 Then Call QuitarObjetos(LingoteOro, ObjData(itemIndex).LingO, Userindex)
    If ObjData(itemIndex).LingP > 0 Then Call QuitarObjetos(LingotePlata, ObjData(itemIndex).LingP, Userindex)
    If ObjData(itemIndex).Gemas > 0 Then Call QuitarObjetos(GemaI, ObjData(itemIndex).Gemas, Userindex)
    If ObjData(itemIndex).Diamantes > 0 Then Call QuitarObjetos(Diamante, ObjData(itemIndex).Diamantes, Userindex)

    'pluto:2.10
    If ObjData(itemIndex).Madera < 1 And ObjData(itemIndex).LingH < 1 And ObjData(itemIndex).LingP < 1 And ObjData( _
       itemIndex).LingO < 1 And ObjData(itemIndex).Gemas < 1 And ObjData(itemIndex).Diamantes < 1 Then
        Call LogCasino("Jugador:" & UserList(Userindex).Name & " Ermitaño materiales cero OBJ: " & itemIndex & "Ip: " _
                       & UserList(Userindex).ip)
        Exit Sub

    End If

    Exit Sub
fallo:
    Call LogError("ermitañoquitarmateriales " & Err.number & " D: " & Err.Description)

End Sub

'[MerLiNz:6]
Function ermitanoTieneMateriales(ByVal Userindex As Integer, _
                                 ByVal itemIndex As Integer) As Boolean

    On Error GoTo fallo

    If ObjData(itemIndex).Madera > 0 Then
        If Not TieneObjetos(Leña, ObjData(itemIndex).Madera, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes madera." & "´" & FontTypeNames.FONTTYPE_INFO)
            ermitanoTieneMateriales = False
            Exit Function

        End If

    End If

    'pluto:2.4.5
    If ObjData(itemIndex).LingH > 0 Then
        If Not TieneObjetos(LingoteHierro, ObjData(itemIndex).LingH, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes Hierro." & "´" & FontTypeNames.FONTTYPE_INFO)
            ermitanoTieneMateriales = False
            Exit Function

        End If

    End If

    If ObjData(itemIndex).LingP > 0 Then
        If Not TieneObjetos(LingotePlata, ObjData(itemIndex).LingP, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes plata." & "´" & FontTypeNames.FONTTYPE_INFO)
            ermitanoTieneMateriales = False
            Exit Function

        End If

    End If

    If ObjData(itemIndex).LingO > 0 Then
        If Not TieneObjetos(LingoteOro, ObjData(itemIndex).LingO, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes oro." & "´" & FontTypeNames.FONTTYPE_INFO)
            ermitanoTieneMateriales = False
            Exit Function

        End If

    End If

    If ObjData(itemIndex).Gemas > 0 Then
        If Not TieneObjetos(GemaI, ObjData(itemIndex).Gemas, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes gemas." & "´" & FontTypeNames.FONTTYPE_INFO)
            ermitanoTieneMateriales = False
            Exit Function

        End If

    End If

    If ObjData(itemIndex).Diamantes > 0 Then
        If Not TieneObjetos(Diamante, ObjData(itemIndex).Diamantes, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes diamantes." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            ermitanoTieneMateriales = False
            Exit Function

        End If

    End If

    'pluto:2.10
    If ObjData(itemIndex).Madera < 1 And ObjData(itemIndex).LingH < 1 And ObjData(itemIndex).LingP < 1 And ObjData( _
       itemIndex).LingO < 1 And ObjData(itemIndex).Gemas < 1 And ObjData(itemIndex).Diamantes < 1 Then
        Call LogCasino("Jugador:" & UserList(Userindex).Name & "Ermitaño materiales cero (b) OBJ: " & itemIndex & _
                       "Ip: " & UserList(Userindex).ip)
        ermitanoTieneMateriales = False
        Exit Function

    End If

    ermitanoTieneMateriales = True
    '[\END]
    Exit Function
fallo:
    Call LogError("ermitañotienemateriales " & Err.number & " D: " & Err.Description)

End Function

Function CarpinteroTieneMateriales(ByVal Userindex As Integer, _
                                   ByVal itemIndex As Integer) As Boolean

    On Error GoTo fallo

    If ObjData(itemIndex).Madera > 0 Then
        If Not TieneObjetos(Leña, ObjData(itemIndex).Madera, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes madera." & "´" & FontTypeNames.FONTTYPE_INFO)
            CarpinteroTieneMateriales = False
            Exit Function

        End If

    End If

    'pluto:2.10
    If ObjData(itemIndex).Madera < 1 Then
        Call LogCasino("Jugador:" & UserList(Userindex).Name & "Carpintero materiales cero (A) OBJ: " & itemIndex & _
                       "Ip: " & UserList(Userindex).ip)
        CarpinteroTieneMateriales = False
        Exit Function

    End If

    CarpinteroTieneMateriales = True
    Exit Function
fallo:
    Call LogError("carpinterotienemateriales " & Err.number & " D: " & Err.Description)

End Function

Function HerreroTieneMateriales(ByVal Userindex As Integer, _
                                ByVal itemIndex As Integer) As Boolean

    On Error GoTo fallo

    If ObjData(itemIndex).LingH > 0 Then
        If Not TieneObjetos(LingoteHierro, ObjData(itemIndex).LingH, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes lingotes de hierro." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            HerreroTieneMateriales = False
            Exit Function

        End If

    End If

    If ObjData(itemIndex).LingP > 0 Then
        If Not TieneObjetos(LingotePlata, ObjData(itemIndex).LingP, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes lingotes de plata." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            HerreroTieneMateriales = False
            Exit Function

        End If

    End If

    If ObjData(itemIndex).LingO > 0 Then
        If Not TieneObjetos(LingoteOro, ObjData(itemIndex).LingO, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes suficientes lingotes de oro." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            HerreroTieneMateriales = False
            Exit Function

        End If

    End If

    'pluto:2.10
    If ObjData(itemIndex).LingH < 1 And ObjData(itemIndex).LingP < 1 And ObjData(itemIndex).LingO < 1 Then
        Call LogCasino("Jugador:" & UserList(Userindex).Name & "Herrero materiales cero (b) OBJ: " & itemIndex & _
                       "Ip: " & UserList(Userindex).ip)
        HerreroTieneMateriales = False
        Exit Function

    End If

    HerreroTieneMateriales = True
    Exit Function
fallo:
    Call LogError("herrerotienemateriales " & Err.number & " D: " & Err.Description)

End Function

Public Function PuedeConstruir(ByVal Userindex As Integer, _
                               ByVal itemIndex As Integer) As Boolean

    On Error GoTo fallo

    PuedeConstruir = HerreroTieneMateriales(Userindex, itemIndex) And UserList(Userindex).Stats.UserSkills(Herreria) _
                     >= ObjData(itemIndex).SkHerreria

    Exit Function
fallo:
    Call LogError("puedeconstruir " & Err.number & " D: " & Err.Description)

End Function

Public Sub HerreroConstruirItem(ByVal Userindex As Integer, ByVal itemIndex As Integer)

    On Error GoTo fallo

    If PuedeConstruir(Userindex, itemIndex) Then
        Call HerreroQuitarMateriales(Userindex, itemIndex)

        ' AGREGAR FX
        If ObjData(itemIndex).OBJType = OBJTYPE_WEAPON Then
            Call SendData(ToIndex, Userindex, 0, "||Has construido el arma!." & "´" & FontTypeNames.FONTTYPE_INFO)
        ElseIf ObjData(itemIndex).OBJType = OBJTYPE_ESCUDO Then
            Call SendData(ToIndex, Userindex, 0, "||Has construido el escudo!." & "´" & FontTypeNames.FONTTYPE_INFO)
        ElseIf ObjData(itemIndex).OBJType = OBJTYPE_CASCO Then
            Call SendData(ToIndex, Userindex, 0, "||Has construido el casco!." & "´" & FontTypeNames.FONTTYPE_INFO)
        ElseIf ObjData(itemIndex).OBJType = OBJTYPE_ARMOUR Then
            Call SendData(ToIndex, Userindex, 0, "||Has construido la armadura!." & "´" & FontTypeNames.FONTTYPE_INFO)
            '[GAU]
        ElseIf ObjData(itemIndex).OBJType = OBJTYPE_BOTA Then
            Call SendData(ToIndex, Userindex, 0, "||Has construido las botas!." & "´" & FontTypeNames.FONTTYPE_INFO)

            '[GAU]
        End If

        'PLUTO:6.0a
        If ObjData(itemIndex).ParaHerre = 0 Then
            Call LogNpcFundidor("Nombre: " & UserList(Userindex).Name & " intenta fabricar Obj: " & itemIndex & _
                                " con herrero.")
            Exit Sub

        End If

        Dim MiObj As obj
        MiObj.Amount = 1
        MiObj.ObjIndex = itemIndex

        'pluto:6.0A
        Call LogNpcFundidor("Nombre: " & UserList(Userindex).Name & " fabrica Obj: " & itemIndex)

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)
            Call LogCasino("Jugador:" & UserList(Userindex).Name & " fabrica herrero inventario lleno(A) " & _
                           itemIndex & "Ip: " & UserList(Userindex).ip)
            UserList(Userindex).Alarma = 1
            UserList(Userindex).ObjetosTirados = UserList(Userindex).ObjetosTirados + 1

        End If

        'pluto.2.4.1
        UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + (CInt((UserList(Userindex).Stats.ELV / 10) + _
                                                                              1) * MiObj.Amount)
        Call CheckUserLevel(Userindex)
        Call senduserstatsbox(Userindex)

        Call SubirSkill(Userindex, Herreria)
        Call UpdateUserInv(True, Userindex, 0)
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & MARTILLOHERRERO)

    End If

    Exit Sub
fallo:
    Call LogError("herreroconstruyeitem " & Err.number & " D: " & Err.Description)

End Sub

Public Sub CarpinteroConstruirItem(ByVal Userindex As Integer, ByVal itemIndex As Integer)

    On Error GoTo fallo

    Dim MiObj As obj
    Dim X As Integer

    If CarpinteroTieneMateriales(Userindex, itemIndex) And UserList(Userindex).Stats.UserSkills(Carpinteria) >= _
       ObjData(itemIndex).SkCarpinteria Then

        'PLUTO:6.0a
        If ObjData(itemIndex).ParaCarpin = 0 Then
            Call LogNpcFundidor("Nombre: " & UserList(Userindex).Name & " intenta fabricar Obj: " & itemIndex & _
                                " con carpintero.")
            Exit Sub

        End If

        'pluto:2.14---------------------------
        If (ObjData(itemIndex).OBJType = OBJTYPE_FLECHAS) Then

            For X = 1 To UserList(Userindex).Stats.ELV * 5

                If CarpinteroTieneMateriales(Userindex, itemIndex) And UserList(Userindex).Stats.UserSkills( _
                   Carpinteria) >= ObjData(itemIndex).SkCarpinteria Then

                    Call CarpinteroQuitarMateriales(Userindex, itemIndex)
                Else
                    Exit For
                End If    'tienematerial

            Next X

            MiObj.Amount = X - 1
            MiObj.ObjIndex = itemIndex

            If MiObj.Amount > 0 Then

                If Not MeterItemEnInventario(Userindex, MiObj) Then
                    'pluto:2.9.0
                    UserList(Userindex).ObjetosTirados = UserList(Userindex).ObjetosTirados + 1
                    Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)
                    Call LogCasino("Jugador:" & UserList(Userindex).Name & _
                                   " fabrica flecha carpintero inventario lleno(C) " & itemIndex & "Ip: " & UserList( _
                                   Userindex).ip)
                    UserList(Userindex).Alarma = 1
                End If    'meter invent
            End If    'amount>0

            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & LABUROCARPINTERO)

        Else    'no flechas

            '----------------------------------

            Call CarpinteroQuitarMateriales(Userindex, itemIndex)
            Call SendData(ToIndex, Userindex, 0, "E5")

            'Dim MiObj As obj
            MiObj.Amount = 1
            MiObj.ObjIndex = itemIndex

            'pluto:6.0A
            If itemIndex <> 163 And itemIndex <> 960 Then
                Call LogNpcFundidor("Nombre: " & UserList(Userindex).Name & " fabrica Obj: " & itemIndex)

            End If

            If Not MeterItemEnInventario(Userindex, MiObj) Then
                Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)
                Call LogCasino("Jugador:" & UserList(Userindex).Name & " fabrica carpintero inventario lleno(A) " & _
                               itemIndex & "Ip: " & UserList(Userindex).ip)
                UserList(Userindex).ObjetosTirados = UserList(Userindex).ObjetosTirados + 1
                UserList(Userindex).Alarma = 1

            End If

            'pluto.2.4.1
            UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + (CInt((UserList(Userindex).Stats.ELV / _
                                                                                   10) + 1) * MiObj.Amount)
            Call CheckUserLevel(Userindex)
            Call senduserstatsbox(Userindex)

            Call SubirSkill(Userindex, Carpinteria)
            Call UpdateUserInv(True, Userindex, 0)
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & LABUROCARPINTERO)

        End If

    End If    'flechas

    Exit Sub
fallo:
    Call LogError("carpinteroconstruyeitem " & Err.number & " D: " & Err.Description)

End Sub

'[MerLiNz:6]
Public Sub ermitanoConstruirItem(ByVal Userindex As Integer, ByVal itemIndex As Integer)

    On Error GoTo fallo

    Dim MiObj As obj
    Dim X As Integer
    Dim cons As Boolean
    cons = False

    'pluto:2.10
    If ermitanoTieneMateriales(Userindex, itemIndex) And UserList(Userindex).Stats.UserSkills(Carpinteria) >= ObjData( _
       itemIndex).SkCarpinteria And UserList(Userindex).Stats.UserSkills(Herreria) >= ObjData( _
       itemIndex).SkHerreria Then

        'PLUTO:6.0a
        If ObjData(itemIndex).ParaErmi = 0 Then
            Call LogNpcFundidor("Nombre: " & UserList(Userindex).Name & " intenta fabricar Obj: " & itemIndex & _
                                " con ermitaño.")
            Exit Sub

        End If

        If (ObjData(itemIndex).OBJType = OBJTYPE_FLECHAS) Then

            For X = 1 To 10

                If ermitanoTieneMateriales(Userindex, itemIndex) And UserList(Userindex).Stats.UserSkills( _
                   Carpinteria) >= ObjData(itemIndex).SkCarpinteria And UserList(Userindex).Stats.UserSkills( _
                   Herreria) >= ObjData(itemIndex).SkHerreria Then
                    cons = True
                    Call ermitanoQuitarMateriales(Userindex, itemIndex)
                Else
                    Exit For

                End If

            Next X

            MiObj.Amount = X - 1
            MiObj.ObjIndex = itemIndex

            If MiObj.Amount > 0 Then

                If Not MeterItemEnInventario(Userindex, MiObj) Then
                    'pluto:2.9.0
                    UserList(Userindex).ObjetosTirados = UserList(Userindex).ObjetosTirados + 1
                    Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)
                    Call LogCasino("Jugador:" & UserList(Userindex).Name & " fabrica ermitaño inventario lleno(C) " & _
                                   itemIndex & "Ip: " & UserList(Userindex).ip)
                    UserList(Userindex).Alarma = 1

                End If    'meter
            End If    'amount>0

            If (ObjData(itemIndex).SkCarpinteria > 0) Then Call SubirSkill(Userindex, Carpinteria)
            If (ObjData(itemIndex).SkHerreria > 0) Then Call SubirSkill(Userindex, Herreria)
            Call UpdateUserInv(True, Userindex, 0)
        Else    ' no flechas

            If ermitanoTieneMateriales(Userindex, itemIndex) And UserList(Userindex).Stats.UserSkills(Carpinteria) >= _
               ObjData(itemIndex).SkCarpinteria And UserList(Userindex).Stats.UserSkills(Herreria) >= ObjData( _
               itemIndex).SkHerreria Then

                Call ermitanoQuitarMateriales(Userindex, itemIndex)
                Call SendData(ToIndex, Userindex, 0, "E5")
                'pluto:6.0A
                Call LogNpcFundidor("Nombre: " & UserList(Userindex).Name & " fabrica Obj: " & itemIndex)

                MiObj.Amount = 1
                MiObj.ObjIndex = itemIndex

                If Not MeterItemEnInventario(Userindex, MiObj) Then
                    'Call Encarcelar(UserIndex, 10)
                    Call LogCasino("Jugador:" & UserList(Userindex).Name & " fabrica ermitaño inventario lleno(B) " & _
                                   itemIndex & "Ip: " & UserList(Userindex).ip)
                    'Call TirarItemAlPiso(UserList(UserIndex).pos, MiObj)
                    'pluto:2.9.0
                    UserList(Userindex).ObjetosTirados = UserList(Userindex).ObjetosTirados + 1
                    UserList(Userindex).Alarma = 1

                End If

                If (ObjData(itemIndex).SkCarpinteria > 0) Then Call SubirSkill(Userindex, Carpinteria)
                If (ObjData(itemIndex).SkHerreria > 0) Then Call SubirSkill(Userindex, Herreria)
                'pluto.2.4.1
                UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + (CInt((UserList(Userindex).Stats.ELV _
                                                                                       / 10) + 1) * MiObj.Amount)
                Call CheckUserLevel(Userindex)
                Call senduserstatsbox(Userindex)

                Call UpdateUserInv(True, Userindex, 0)
                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & LABUROCARPINTERO)

            End If

        End If

        If (cons = True) Then
            Call SendData(ToIndex, Userindex, 0, "E5")
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & LABUROCARPINTERO)

        End If

        '[\END]

    End If    ' pluto:2.10

    Exit Sub
fallo:
    Call LogError("ermitañoconstruyeitem " & Err.number & " D: " & Err.Description)

End Sub

Public Sub DoLingotes(ByVal Userindex As Integer)

    On Error GoTo fallo

    'pluto:2.6.0 lingotes de 5 en 5 y 25 materiales a lo largo de todo el sub

    If UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount < 25 Then
        Call SendData(ToIndex, Userindex, 0, "||No tienes suficientes minerales para hacer lingotes." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'pluto:6.7--------
    If ObjData(UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).ObjIndex).OBJType <> 23 _
       Then
        Call SendData(ToIndex, Userindex, 0, "||No tienes suficientes minerales para hacer lingotes." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Call LogError("Posible Bug hacer lingotes en " & UserList(Userindex).Name)
        Exit Sub

    End If

    '-----------------
    'pluto:2.4  posibilidad hacer lingotes con skill suerte
    If RandomNumber(1, ObjData(UserList(Userindex).flags.TargetObjInvIndex).MinSkill) < 10 + CInt(UserList( _
                                                                                                  Userindex).Stats.UserSkills(suerte) / 10) + CInt(UserList(Userindex).Stats.ELV / 2) Then

        UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount = UserList( _
                                                                                               Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount - 25

        If UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount < 1 Then
            UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount = 0
            UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).ObjIndex = 0

        End If

        Call SendData(ToIndex, Userindex, 0, "E6")
        Dim nPos As WorldPos
        Dim MiObj As obj
        MiObj.Amount = 5
        MiObj.ObjIndex = ObjData(UserList(Userindex).flags.TargetObjInvIndex).LingoteIndex

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        End If

        Call UpdateUserInv(False, Userindex, UserList(Userindex).flags.TargetObjInvSlot)
        'pluto.2.4.1
        UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + (CInt((UserList(Userindex).Stats.ELV / 10) + _
                                                                              1) * MiObj.Amount)
        Call CheckUserLevel(Userindex)
        Call senduserstatsbox(Userindex)

        'Call SendData(ToIndex, UserIndex, 0, "||¡Has obtenido cinco lingotes!" & FONTTYPENAMES.FONTTYPE_INFO)
    Else

        UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount = UserList( _
                                                                                               Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount - 25

        If UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount < 1 Then
            UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).Amount = 0
            UserList(Userindex).Invent.Object(UserList(Userindex).flags.TargetObjInvSlot).ObjIndex = 0

        End If

        Call UpdateUserInv(False, Userindex, UserList(Userindex).flags.TargetObjInvSlot)
        Call SendData(ToIndex, Userindex, 0, "E7")

    End If

    Exit Sub
fallo:
    Call LogError("dolingotes " & Err.number & " D: " & Err.Description)

End Sub

Function ModNavegacion(ByVal clase As String) As Integer

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "PIRATA"
        ModNavegacion = 1

    Case "PESCADOR"
        ModNavegacion = 1.2

    Case Else
        ModNavegacion = 2.3

    End Select

    Exit Function
fallo:
    Call LogError("modnavegacion " & Err.number & " D: " & Err.Description)

End Function

Function ModFundicion(ByVal clase As String) As Integer

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "MINERO"
        ModFundicion = 1

    Case "HERRERO"
        ModFundicion = 1.2

    Case "ERMITAÑO"
        ModFundicion = 1.6

    Case Else
        ModFundicion = 3

    End Select

    Exit Function
fallo:
    Call LogError("modfundicion " & Err.number & " D: " & Err.Description)

End Function

Function ModCarpinteria(ByVal clase As String) As Integer

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "CARPINTERO"
        ModCarpinteria = 1

    Case "ERMITAÑO"
        ModCarpinteria = 1

    Case Else
        ModCarpinteria = 3

    End Select

    Exit Function
fallo:
    Call LogError("modcarpinteria " & Err.number & " D: " & Err.Description)

End Function

Function ModHerreriA(ByVal clase As String) As Integer

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "HERRERO"
        ModHerreriA = 1

    Case "MINERO"
        ModHerreriA = 1.2

    Case "ERMITAÑO"
        ModHerreriA = 1

    Case Else
        ModHerreriA = 4

    End Select

    Exit Function
fallo:
    Call LogError("modherreria " & Err.number & " D: " & Err.Description)

End Function

'pluto:2.4.5
Function ModMagia(ByVal clase As String) As Single

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "MAGO"
        ModMagia = 1

    Case "DRUIDA"
        ModMagia = 1

    Case "BARDO"
        ModMagia = 1

    Case "CLERIGO"
        ModMagia = 1

    Case "ASESINO"
        ModMagia = 1

    Case "PALADIN"
        ModMagia = 1

    Case "GUERRERO"
        ModMagia = 1

    Case "CAZADOR"
        ModMagia = 1

    Case "ARQUERO"
        ModMagia = 1

    Case Else
        'nati: cambio el modmagia 0.9 por 1 porque no se puede dividir con él.
        ModMagia = 1

    End Select

    Exit Function
fallo:
    Call LogError("modmagia " & Err.number & " D: " & Err.Description)

End Function

Function ModDomar(ByVal clase As String) As Integer

    On Error GoTo fallo

    Select Case UCase$(clase)

        'pluto:2.3
    Case "DOMADOR"
        ModDomar = 8

    Case "DRUIDA"
        ModDomar = 12

    Case "CAZADOR"
        ModDomar = 12

    Case "CLERIGO"
        ModDomar = 14

    Case Else
        ModDomar = 20

    End Select

    Exit Function
fallo:
    Call LogError("moddomar " & Err.number & " D: " & Err.Description)

End Function

Function CalcularPoderDomador(ByVal Userindex As Integer) As Long

    On Error GoTo fallo

    CalcularPoderDomador = UserList(Userindex).Stats.UserAtributos(Carisma) * (CInt(UserList( _
                                                                                    Userindex).Stats.UserSkills(Domar) / 2) / ModDomar(UserList(Userindex).clase)) + RandomNumber(1, UserList( _
                                                                                                                                                                                     Userindex).Stats.UserAtributos(Carisma) / 3) + RandomNumber(1, UserList(Userindex).Stats.UserAtributos( _
                                                                                                                                                                                                                                                    Carisma) / 3) + RandomNumber(1, UserList(Userindex).Stats.UserAtributos(Carisma) / 3)

    Exit Function
fallo:
    Call LogError("calcularpoderdomador " & Err.number & " D: " & Err.Description)

End Function

Function FreeMascotaIndex(ByVal Userindex As Integer) As Integer

    On Error GoTo fallo

    'Call LogTarea("Sub FreeMascotaIndex")
    Dim J As Integer

    For J = 1 To MAXMASCOTAS

        If UserList(Userindex).MascotasIndex(J) = 0 Then
            FreeMascotaIndex = J
            Exit Function

        End If

    Next J

    Exit Function
fallo:
    Call LogError("freemascotaindex " & Err.number & " D: " & Err.Description)

End Function

Sub DoDomar(ByVal Userindex As Integer, ByVal NpcIndex As Integer)
'Call LogTarea("Sub DoDomar")

    On Error GoTo fallo

    Dim nPos As WorldPos
    Dim MiObj As obj
    Dim n As Byte
    Dim tc As Integer
    Dim UserFile As String

    'PLUTO:6.3---------------
    If NpcIndex = 0 Then
        'If UserList(UserIndex).flags.Macreanda > 0 Then
        UserList(Userindex).flags.ComproMacro = 0
        UserList(Userindex).flags.Macreanda = 0
        Call SendData(ToIndex, Userindex, 0, "O3")
        Exit Sub

        'End If
    End If

    If Npclist(NpcIndex).MaestroUser > 0 Then
        'If UserList(UserIndex).flags.Macreanda > 0 Then
        UserList(Userindex).flags.ComproMacro = 0
        UserList(Userindex).flags.Macreanda = 0
        Call SendData(ToIndex, Userindex, 0, "O3")
        Exit Sub

        'End If
    End If

    '--------------------------

    UserFile = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"

    If UserList(Userindex).NroMacotas < MAXMASCOTAS Then

        If Npclist(NpcIndex).MaestroUser = Userindex Then
            Call SendData(ToIndex, Userindex, 0, "||La criatura ya te ha aceptado como su amo." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If Npclist(NpcIndex).MaestroNpc > 0 Or Npclist(NpcIndex).MaestroUser > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||La criatura ya tiene amo." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'pluto:6.0A
        If UserList(Userindex).Nmonturas > 2 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes tener más de 3 Mascotas." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'quitar esto
        If UserList(Userindex).flags.Privilegios > 2 Then GoTo domo

        'pluto:2.4.1
        If Npclist(NpcIndex).NPCtype = 60 And Npclist(NpcIndex).flags.Domable <> 506 And (UCase$(UserList( _
                                                                                                 Userindex).clase) <> "DOMADOR" Or UserList(Userindex).Stats.UserSkills(Domar) < Npclist( _
                                                                                                 NpcIndex).SkillDomar Or UserList(Userindex).Stats.ELV < 40) Then
            Call SendData(ToIndex, Userindex, 0, "P1")
            Exit Sub

        End If

        If Npclist(NpcIndex).flags.Domable <= CalcularPoderDomador(Userindex) Or Npclist(NpcIndex).NPCtype = 60 Then

            'pluto:2.4.1
            If Npclist(NpcIndex).NPCtype = 60 Then

                'pluto:2.18.Domable
                If UserList(Userindex).Stats.UserSkills(Domar) < 200 And Npclist(NpcIndex).flags.Domable <> 506 Then
                    Call SendData(ToIndex, Userindex, 0, "P1")
                    Exit Sub

                End If

                Dim aa As Integer
                aa = RandomNumber(1, (Npclist(NpcIndex).Stats.MaxHP * 5))

                'quitar esto
                'server secundario cambio <>20 por >10 para facilitar el domar
                'If aa <> 20 Then
                'If ServerPrimario = 2 Then
                '   If aa > 10 Then
                '  Call SendData(ToIndex, UserIndex, 0, "P2")
                ' Exit Sub
                'End If
                'Else
                If aa <> 20 Then
                    Call SendData(ToIndex, Userindex, 0, "P2")
                    Exit Sub

                End If

                'End If

                'pluto:6.0A---------------------------
                tc = Npclist(NpcIndex).flags.Domable + 387
                MiObj.Amount = 1
                MiObj.ObjIndex = tc

                If TieneObjetos(tc, 1, Userindex) Then
                    Call SendData(ToIndex, Userindex, 0, "||Ya tienes esa clase de mascota." & "´" & _
                                                         FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'miramos que no repita mascota
                For n = 1 To 3

                    If val(GetVar(UserFile, "MONTURA" & n, "TIPO")) = Npclist(NpcIndex).flags.Domable - 500 Then
                        Call SendData(ToIndex, Userindex, 0, _
                                      "||Ya tienes esa clase de mascota, ve a la cuidadora de mascotas en Banderbill a recuperarla." _
                                      & "´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                Next n

                '----------------------------------------------------------

            End If

            'quitar esto
domo:
            'pluto:2.4
            Dim MinPc As npc
            MinPc = Npclist(NpcIndex)

            If Npclist(NpcIndex).NPCtype = 60 And MinPc.MaestroUser = 0 Then

                Call DomarMontura(Userindex, NpcIndex)

                'pluto:6.5
                If NoDomarMontura = True Then
                    NoDomarMontura = False
                    Exit Sub

                End If

                Dim CabalgaPos As WorldPos
                Dim mapita As Integer
                Dim ini As Integer

                'evitamos respawn otro mapa del jabato
                If MinPc.flags.Domable = 506 Then
                    MinPc.flags.Respawn = 0
                    Call ReSpawnNpc(MinPc)
                    Exit Sub

                End If

                CabalgaPos.X = 50
                CabalgaPos.Y = 50
a:
                mapita = RandomNumber(1, 270)
                CabalgaPos.Map = mapita

                'If MapInfo(CabalgaPos.Map).Pk = False Or MapInfo(CabalgaPos.Map).BackUp = 1 Or MapInfo(CabalgaPos.Map).Terreno <> "BOSQUE" Then GoTo a:
                If MapInfo(CabalgaPos.Map).Domar > 0 Then GoTo a:
                ini = SpawnNpc(MinPc.numero, CabalgaPos, False, True)

                If ini = MAXNPCS Then GoTo a
                Call WriteVar(IniPath & "cabalgar.txt", MinPc.Name, "Mapa", val(mapita))
                Exit Sub

            End If

            '---fin pluto:2.4----

            Dim index As Integer
            UserList(Userindex).NroMacotas = UserList(Userindex).NroMacotas + 1
            index = FreeMascotaIndex(Userindex)

            'pluto:2.4
            If index = 0 Then Exit Sub

            UserList(Userindex).MascotasIndex(index) = NpcIndex
            UserList(Userindex).MascotasType(index) = Npclist(NpcIndex).numero

            Npclist(NpcIndex).MaestroUser = Userindex

            Call FollowAmo(NpcIndex)

            Call SendData(ToIndex, Userindex, 0, "||La criatura te ha aceptado como su amo." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Call SubirSkill(Userindex, Domar)

            'PLUTO:6.3
            If UserList(Userindex).flags.Macreanda > 0 Then
                UserList(Userindex).flags.ComproMacro = 0
                UserList(Userindex).flags.Macreanda = 0
                Call SendData(ToIndex, Userindex, 0, "O3")

            End If

            '---------------------------

            'pluto:2.4 respawn de los domados
            If Npclist(NpcIndex).NPCtype <> 60 Then
                Call ReSpawnNpc(MinPc)

            End If

        Else
            Call SendData(ToIndex, Userindex, 0, "P3")

        End If

    Else
        Call SendData(ToIndex, Userindex, 0, "||No podes controlar mas criaturas." & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    Exit Sub
fallo:
    Call LogError("dodomar " & UserList(Userindex).Name & " " & Err.number & " D: " & Err.Description)

End Sub

Sub DoAdminInvisible(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).flags.AdminInvisible = 0 Then
        'Debug.Print "admin invi"
        UserList(Userindex).flags.AdminInvisible = 1
        'UserList(UserIndex).Flags.Invisible = 1
        UserList(Userindex).flags.OldBody = UserList(Userindex).Char.Body
        UserList(Userindex).flags.OldHead = UserList(Userindex).Char.Head
        UserList(Userindex).Char.Body = 226
        UserList(Userindex).Char.Head = 850
        'Debug.Print

    Else

        UserList(Userindex).flags.AdminInvisible = 0
        'UserList(UserIndex).Flags.Invisible = 0
        UserList(Userindex).Char.Body = UserList(Userindex).flags.OldBody
        UserList(Userindex).Char.Head = UserList(Userindex).flags.OldHead

    End If

    '[GAU] Agregamo UserList(UserIndex).Char.Botas
    Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Char.Body, UserList( _
                                                                                                         Userindex).Char.Head, UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList( _
                                                                                                                                                                                                      Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList( _
                                                                                                                                                                                                                                                                                                      Userindex).Char.AlasAnim)
    Exit Sub
fallo:
    Call LogError("doadmininvisible " & Err.number & " D: " & Err.Description)

End Sub

Sub TratarDeHacerFogata(ByVal Map As Integer, _
                        ByVal X As Integer, _
                        ByVal Y As Integer, _
                        ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim suerte As Byte
    Dim exito As Byte
    Dim raise As Byte
    Dim obj As obj

    If Not LegalPos(Map, X, Y) Then Exit Sub

    If MapData(Map, X, Y).OBJInfo.Amount < 3 Then
        Call SendData(ToIndex, Userindex, 0, "K9")
        Exit Sub

    End If

    If UserList(Userindex).Stats.UserSkills(Supervivencia) < 50 Then
        suerte = 10
    ElseIf UserList(Userindex).Stats.UserSkills(Supervivencia) >= 50 And UserList(Userindex).Stats.UserSkills( _
           Supervivencia) <= 120 Then
        suerte = 5
    ElseIf UserList(Userindex).Stats.UserSkills(Supervivencia) >= 120 Then
        suerte = 2

    End If

    exito = RandomNumber(1, suerte)

    If exito = 1 Then
        obj.ObjIndex = FOGATA_APAG
        obj.Amount = MapData(Map, X, Y).OBJInfo.Amount / 3

        If obj.Amount > 1 Then
            Call SendData(ToIndex, Userindex, 0, "||Has hecho " & obj.Amount & " fogatas." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
        Else
            Call SendData(ToIndex, Userindex, 0, "K7")

        End If

        Call MakeObj(ToMap, 0, Map, obj, Map, X, Y)

        Dim Fogatita As New cGarbage
        Fogatita.Map = Map
        Fogatita.X = X
        Fogatita.Y = Y
        Call TrashCollector.Add(Fogatita)

    Else
        Call SendData(ToIndex, Userindex, 0, "K8")

    End If

    Call SubirSkill(Userindex, Supervivencia)

    Exit Sub
fallo:
    Call LogError("tratarhacerfogata " & Err.number & " D: " & Err.Description)

End Sub

Public Sub DoPescar(ByVal Userindex As Integer)

    On Error GoTo errhandler

    Dim suerte As Integer
    Dim res As Integer
    'pluto:2.12
    UserList(Userindex).Counters.IdleCount = 0

    If UserList(Userindex).clase = "Pescador" Then
        Call QuitarSta(Userindex, EsfuerzoPescarPescador)
    Else
        Call QuitarSta(Userindex, EsfuerzoPescarGeneral)

    End If

    If UserList(Userindex).Stats.UserSkills(Pesca) <= 20 And UserList(Userindex).Stats.UserSkills(Pesca) >= -1 Then
        suerte = 35
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 40 And UserList(Userindex).Stats.UserSkills(Pesca) >= 21 Then
        suerte = 30
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 60 And UserList(Userindex).Stats.UserSkills(Pesca) >= 41 Then
        suerte = 28
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 80 And UserList(Userindex).Stats.UserSkills(Pesca) >= 61 Then
        suerte = 24
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 100 And UserList(Userindex).Stats.UserSkills(Pesca) >= 81 Then
        suerte = 22
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 120 And UserList(Userindex).Stats.UserSkills(Pesca) >= 101 _
           Then
        suerte = 20
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 140 And UserList(Userindex).Stats.UserSkills(Pesca) >= 121 _
           Then
        suerte = 18
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 160 And UserList(Userindex).Stats.UserSkills(Pesca) >= 141 _
           Then
        suerte = 16
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 180 And UserList(Userindex).Stats.UserSkills(Pesca) >= 161 _
           Then
        suerte = 14
    ElseIf UserList(Userindex).Stats.UserSkills(Pesca) <= 200 And UserList(Userindex).Stats.UserSkills(Pesca) >= 181 _
           Then
        suerte = 13

    End If

    If UserList(Userindex).Stats.UserSkills(Pesca) = 200 Then suerte = 12

    res = RandomNumber(1, suerte)

    'PLuto:2.4
    Dim res2 As Integer
    res2 = RandomNumber(1, 2000)
    Dim nPos As WorldPos
    Dim MiObj As obj

    'pluto:2.4.1
    If res2 > 1999 Then
        MiObj.Amount = 1
        MiObj.ObjIndex = 963

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        End If

        Exit Sub

    End If

    If res < 11 Then

        'pluto:2.4.5
        'If res > 5 Then res = 1
        If UserList(Userindex).clase = "Pescador" Then
            MiObj.Amount = RandomNumber(1, CInt(UserList(Userindex).Stats.ELV / 4))
        Else
            MiObj.Amount = 1

        End If

        If UserList(Userindex).Invent.HerramientaEqpObjIndex = 543 Then MiObj.Amount = MiObj.Amount * 1
 
        If MiObj.Amount < 1 Then MiObj.Amount = 1
        If res = 1 Then MiObj.ObjIndex = Pescado5
        If res = 2 Then MiObj.ObjIndex = Pescado4
        If res = 3 Then MiObj.ObjIndex = Pescado3
        If res = 4 Then MiObj.ObjIndex = Pescado2
        If res = 5 Then MiObj.ObjIndex = Pescado1
        If res > 5 And res < 11 Then MiObj.ObjIndex = Pescado

        If Not MeterItemEnInventario(Userindex, MiObj) Then

        End If

        Call SendData(ToIndex, Userindex, 0, "G3")
        'pluto.2.4.1
        UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + (CInt((UserList(Userindex).Stats.ELV / 10) + _
                                                                              1) * MiObj.Amount)
        Call CheckUserLevel(Userindex)
        Call senduserstatsbox(Userindex)
    Else
        Call SendData(ToIndex, Userindex, 0, "G4")

    End If

    Call SubirSkill(Userindex, Pesca)

    Exit Sub

errhandler:
    Call LogError("Error en DoPescar")

End Sub

Public Sub DoRobar(ByVal LadrOnIndex As Integer, ByVal VictimaIndex As Integer)

    On Error GoTo errhandler

    If MapInfo(UserList(VictimaIndex).Pos.Map).Pk = False Then Exit Sub

    'pluto:2.18
    If MapInfo(UserList(VictimaIndex).Pos.Map).Terreno = "ALDEA" Or MapInfo(UserList(VictimaIndex).Pos.Map).Terreno = _
       "TORNEO" Or MapInfo(UserList(VictimaIndex).Pos.Map).Terreno = "EVENTO" Or MapInfo(UserList(VictimaIndex).Pos.Map).Terreno = "TORNEOGM" Then Exit Sub

    'pluto:6.2
    If UserList(VictimaIndex).Name = "Jaba" Then Exit Sub

    If UserList(VictimaIndex).Pos.Map = MapaSeguro Then Exit Sub
    'If UserList(LadrOnIndex).Faccion.ArmadaReal = 1 Then Exit Sub

    If UserList(VictimaIndex).flags.Privilegios < 1 Then
        Dim suerte As Integer
        Dim res As Integer

        If UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 20 And UserList(LadrOnIndex).Stats.UserSkills(Robar) >= _
           -1 Then
            suerte = 35
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 40 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 21 Then
            suerte = 30
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 60 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 41 Then
            suerte = 28
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 80 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 61 Then
            suerte = 24
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 100 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 81 Then
            suerte = 22
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 120 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 101 Then
            suerte = 20
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 140 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 121 Then
            suerte = 18
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 160 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 141 Then
            suerte = 15
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 180 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 161 Then
            suerte = 11
        ElseIf UserList(LadrOnIndex).Stats.UserSkills(Robar) <= 200 And UserList(LadrOnIndex).Stats.UserSkills(Robar) _
               >= 181 Then
            suerte = 7

        End If

        If UserList(LadrOnIndex).Stats.UserSkills(Robar) = 200 Then suerte = 5

        res = RandomNumber(1, suerte)

        If res < 4 Then    'Exito robo

            If (RandomNumber(1, 50) < 18) And (UCase$(UserList(LadrOnIndex).clase) = "LADRON") Then
                If TieneObjetosRobables(VictimaIndex) Then
                    Call RobarObjeto(LadrOnIndex, VictimaIndex)
                Else
                    Call SendData(ToIndex, LadrOnIndex, 0, "||" & UserList(VictimaIndex).Name & " no tiene objetos." _
                                                           & "´" & FontTypeNames.FONTTYPE_INFO)

                End If

            Else    'Roba oro

                If UserList(VictimaIndex).Stats.GLD > 0 Then
                    Dim n As Integer

                    n = RandomNumber(1, 100)

                    If UCase$(UserList(LadrOnIndex).clase) = "LADRON" Then n = n + 1000
                    If UCase$(UserList(LadrOnIndex).clase) = "BANDIDO" Then n = n + 2500
                    If n > UserList(VictimaIndex).Stats.GLD Then n = UserList(VictimaIndex).Stats.GLD
                    UserList(VictimaIndex).Stats.GLD = UserList(VictimaIndex).Stats.GLD - n

                    Call AddtoVar(UserList(LadrOnIndex).Stats.GLD, n, MAXORO)

                    Call SendData(ToIndex, LadrOnIndex, 0, "||Le has robado " & n & " monedas de oro a " & UserList( _
                                                           VictimaIndex).Name & "´" & FontTypeNames.FONTTYPE_INFO)
                    'pluto:2.4.5
                    Call SendUserStatsOro(LadrOnIndex)
                    Call SendUserStatsOro(VictimaIndex)
                Else
                    Call SendData(ToIndex, LadrOnIndex, 0, "||" & UserList(VictimaIndex).Name & " no tiene oro." & _
                                                           "´" & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        Else
            Call SendData(ToIndex, LadrOnIndex, 0, "||¡No has logrado robar nada!" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, VictimaIndex, 0, "||¡" & UserList(LadrOnIndex).Name & " ha intentado robarte!" & _
                                                    "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, VictimaIndex, 0, "||¡" & UserList(LadrOnIndex).Name & " es un criminal!" & "´" & _
                                                    FontTypeNames.FONTTYPE_INFO)

        End If

        If Not Criminal(LadrOnIndex) Then
            'Call VolverCriminal(LadrOnIndex)

        End If

        'If UserList(LadrOnIndex).Faccion.ArmadaReal = 1 Then Call ExpulsarFaccionReal(LadrOnIndex)
        'If UserList(LadrOnIndex).Faccion.ArmadaReal = 2 Then Call ExpulsarFaccionlegion(LadrOnIndex)

        'Call AddtoVar(UserList(LadrOnIndex).Reputacion.LadronesRep, vlLadron, MAXREP)
        Call SubirSkill(LadrOnIndex, Robar)

    End If

    'pluto:2.5.0
    Exit Sub

errhandler:
    Call LogError("Error en DoRobar")

End Sub

Public Function ObjEsRobable(ByVal VictimaIndex As Integer, _
                             ByVal Slot As Integer) As Boolean

    On Error GoTo fallo

    Dim OI As Integer

    OI = UserList(VictimaIndex).Invent.Object(Slot).ObjIndex

    ObjEsRobable = ObjData(OI).OBJType <> OBJTYPE_LLAVES And UserList(VictimaIndex).Invent.Object(Slot).Equipped = 0 _
                   And ObjData(OI).Real = 0 And ObjData(OI).nocaer = 0 And ObjData(OI).Caos = 0

    'pluto:robo barcos equipados
    If ObjData(OI).OBJType = OBJTYPE_BARCOS And UserList(VictimaIndex).flags.Navegando = 1 Then ObjEsRobable = False

    'pluto:roba ropas cabalgar equipados
    If ObjData(OI).OBJType = 42 And UserList(VictimaIndex).flags.Montura > 0 Then ObjEsRobable = False

    Exit Function
fallo:
    Call LogError("objesrobable " & Err.number & " D: " & Err.Description)

End Function

Public Sub RobarObjeto(ByVal LadrOnIndex As Integer, ByVal VictimaIndex As Integer)

    On Error GoTo fallo

    Dim flag As Boolean
    Dim i As Integer
    flag = False

    If RandomNumber(1, 12) < 6 Then    'Comenzamos por el principio o el final?
        i = 1

        Do While Not flag And i <= MAX_INVENTORY_SLOTS

            'Hay objeto en este slot?
            If UserList(VictimaIndex).Invent.Object(i).ObjIndex > 0 Then
                If ObjEsRobable(VictimaIndex, i) Then
                    If RandomNumber(1, 10) < 4 Then flag = True

                End If

            End If

            If Not flag Then i = i + 1
        Loop
    Else
        i = 20

        Do While Not flag And i > 0

            'Hay objeto en este slot?
            If UserList(VictimaIndex).Invent.Object(i).ObjIndex > 0 Then
                If ObjEsRobable(VictimaIndex, i) Then
                    If RandomNumber(1, 10) < 4 Then flag = True

                End If

            End If

            If Not flag Then i = i - 1
        Loop

    End If

    If flag Then
        Dim MiObj As obj
        Dim num As Byte
        'Cantidad al azar
        num = RandomNumber(1, 5)

        If num > UserList(VictimaIndex).Invent.Object(i).Amount Then
            num = UserList(VictimaIndex).Invent.Object(i).Amount

        End If

        MiObj.Amount = num
        MiObj.ObjIndex = UserList(VictimaIndex).Invent.Object(i).ObjIndex

        UserList(VictimaIndex).Invent.Object(i).Amount = UserList(VictimaIndex).Invent.Object(i).Amount - num

        If UserList(VictimaIndex).Invent.Object(i).Amount <= 0 Then
            Call QuitarUserInvItem(VictimaIndex, CByte(i), 1)

        End If

        Call UpdateUserInv(False, VictimaIndex, CByte(i))

        If Not MeterItemEnInventario(LadrOnIndex, MiObj) Then
            Call TirarItemAlPiso(UserList(LadrOnIndex).Pos, MiObj)

        End If

        Call SendData(ToIndex, LadrOnIndex, 0, "||Has robado " & MiObj.Amount & " " & ObjData(MiObj.ObjIndex).Name & _
                                               "´" & FontTypeNames.FONTTYPE_INFO)
    Else
        Call SendData(ToIndex, LadrOnIndex, 0, "||No has robado nada" & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    Exit Sub
fallo:
    Call LogError("robarobjeto " & Err.number & " D: " & Err.Description)

End Sub

Public Sub DoApuñalar(ByVal Userindex As Integer, ByVal VictimNpcIndex As Integer, ByVal VictimUserIndex As Integer, _
                      ByVal daño As Integer)

    On Error GoTo fallo

    Dim suerte As Integer
    Dim res As Integer

    If UserList(Userindex).Stats.UserSkills(Apuñalar) <= 20 And UserList(Userindex).Stats.UserSkills(Apuñalar) >= -1 _
       Then
        suerte = 35
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 40 And UserList(Userindex).Stats.UserSkills(Apuñalar) >= _
           21 Then
        suerte = 30
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 60 And UserList(Userindex).Stats.UserSkills(Apuñalar) >= _
           41 Then
        suerte = 28
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 80 And UserList(Userindex).Stats.UserSkills(Apuñalar) >= _
           61 Then
        suerte = 24
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 100 And UserList(Userindex).Stats.UserSkills(Apuñalar) _
           >= 81 Then
        suerte = 22
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 120 And UserList(Userindex).Stats.UserSkills(Apuñalar) _
           >= 101 Then
        suerte = 20
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 140 And UserList(Userindex).Stats.UserSkills(Apuñalar) _
           >= 121 Then
        suerte = 18
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 160 And UserList(Userindex).Stats.UserSkills(Apuñalar) _
           >= 141 Then
        suerte = 15
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 180 And UserList(Userindex).Stats.UserSkills(Apuñalar) _
           >= 161 Then
        suerte = 12
    ElseIf UserList(Userindex).Stats.UserSkills(Apuñalar) <= 200 And UserList(Userindex).Stats.UserSkills(Apuñalar) _
           >= 181 Then
        suerte = 9

    End If

    If UserList(Userindex).Stats.UserSkills(Apuñalar) = 200 Then suerte = 7

    If UCase$(UserList(Userindex).clase) = "ASESINO" Then suerte = 10
    res = RandomNumber(1, suerte)


    If res <= 4 And UCase$(UserList(Userindex).clase) = "ASESINO" Then
        If VictimUserIndex <> 0 Then
            If UserList(Userindex).Char.Heading = UserList(VictimUserIndex).Char.Heading Then
                UserList(VictimUserIndex).Stats.MinHP = UserList(VictimUserIndex).Stats.MinHP - (daño * 2)
                Call SendData(ToIndex, Userindex, 0, "||Has apuñalado a " & UserList(VictimUserIndex).Name & " por " _
                                                     & (daño * 2) & "´" & FontTypeNames.FONTTYPE_FIGHT)
                Call SendData(ToIndex, VictimUserIndex, 0, "||Te ha apuñalado " & UserList(Userindex).Name & " por " _
                                                           & (daño * 2) & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Else
                UserList(VictimUserIndex).Stats.MinHP = UserList(VictimUserIndex).Stats.MinHP - daño
                Call SendData(ToIndex, Userindex, 0, "||Has apuñalado a " & UserList(VictimUserIndex).Name & " por " _
                                                     & daño & "´" & FontTypeNames.FONTTYPE_FIGHT)
                Call SendData(ToIndex, VictimUserIndex, 0, "||Te ha apuñalado " & UserList(Userindex).Name & " por " _
                                                           & daño & "´" & FontTypeNames.FONTTYPE_FIGHT)

            End If

        Else

            If UserList(Userindex).Char.Heading = Npclist(VictimNpcIndex).Char.Heading Then
                Npclist(VictimNpcIndex).Stats.MinHP = Npclist(VictimNpcIndex).Stats.MinHP - (daño * 2)
                Call SendData(ToIndex, Userindex, 0, "||Has apuñalado la criatura por " & (daño * 2) & "´" & _
                                                     FontTypeNames.FONTTYPE_FIGHT)
            Else
                Npclist(VictimNpcIndex).Stats.MinHP = Npclist(VictimNpcIndex).Stats.MinHP - daño
                Call SendData(ToIndex, Userindex, 0, "||Has apuñalado la criatura por " & daño & "´" & _
                                                     FontTypeNames.FONTTYPE_FIGHT)

            End If

            Call SubirSkill(Userindex, Apuñalar)

        End If
    ElseIf res = 2 Then
        If VictimUserIndex <> 0 Then
            If UserList(Userindex).Char.Heading = UserList(VictimUserIndex).Char.Heading Then
                UserList(VictimUserIndex).Stats.MinHP = UserList(VictimUserIndex).Stats.MinHP - (daño * 2)
                Call SendData(ToIndex, Userindex, 0, "||Has apuñalado a " & UserList(VictimUserIndex).Name & " por " _
                                                     & (daño * 2) & "´" & FontTypeNames.FONTTYPE_FIGHT)
                Call SendData(ToIndex, VictimUserIndex, 0, "||Te ha apuñalado " & UserList(Userindex).Name & " por " _
                                                           & (daño * 2) & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Else
                UserList(VictimUserIndex).Stats.MinHP = UserList(VictimUserIndex).Stats.MinHP - daño
                Call SendData(ToIndex, Userindex, 0, "||Has apuñalado a " & UserList(VictimUserIndex).Name & " por " _
                                                     & daño & "´" & FontTypeNames.FONTTYPE_FIGHT)
                Call SendData(ToIndex, VictimUserIndex, 0, "||Te ha apuñalado " & UserList(Userindex).Name & " por " _
                                                           & daño & "´" & FontTypeNames.FONTTYPE_FIGHT)

            End If

        Else

            If UserList(Userindex).Char.Heading = Npclist(VictimNpcIndex).Char.Heading Then
                Npclist(VictimNpcIndex).Stats.MinHP = Npclist(VictimNpcIndex).Stats.MinHP - (daño * 2)
                Call SendData(ToIndex, Userindex, 0, "||Has apuñalado la criatura por " & (daño * 2) & "´" & _
                                                     FontTypeNames.FONTTYPE_FIGHT)
            Else
                Npclist(VictimNpcIndex).Stats.MinHP = Npclist(VictimNpcIndex).Stats.MinHP - daño
                Call SendData(ToIndex, Userindex, 0, "||Has apuñalado la criatura por " & daño & "´" & _
                                                     FontTypeNames.FONTTYPE_FIGHT)

            End If

            Call SubirSkill(Userindex, Apuñalar)

        End If



    Else

        Call SendData(ToIndex, Userindex, 0, "||No has podido apuñalar a tu enemigo" & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)

    End If

ako:

    Exit Sub
fallo:
    Call LogError("doapuñalar " & Err.number & " D: " & Err.Description)

End Sub

Public Sub DoDobleArma(ByVal Userindex As Integer, ByVal VictimNpcIndex As Integer, ByVal VictimUserIndex As Integer, _
                       ByVal daño As Integer)

    On Error GoTo fallo

    Dim suerte As Integer
    Dim res As Integer

    If UserList(Userindex).Stats.UserSkills(DobleArma) <= 20 And UserList(Userindex).Stats.UserSkills(DobleArma) >= _
       -1 Then
        suerte = 35
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 40 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 21 Then
        suerte = 30
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 60 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 41 Then
        suerte = 28
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 80 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 61 Then
        suerte = 24
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 100 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 81 Then
        suerte = 22
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 120 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 101 Then
        suerte = 20
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 140 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 121 Then
        suerte = 18
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 160 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 141 Then
        suerte = 15
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 180 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 161 Then
        suerte = 12
    ElseIf UserList(Userindex).Stats.UserSkills(DobleArma) <= 200 And UserList(Userindex).Stats.UserSkills(DobleArma) _
           >= 181 Then
        suerte = 9

    End If

    If UserList(Userindex).Stats.UserSkills(DobleArma) = 200 Then suerte = 7
    'If UCase$(UserList(UserIndex).clase) = "ASESINO" Then suerte = suerte - 4
    res = RandomNumber(1, suerte)

    If res < 6 Then
        If VictimUserIndex <> 0 Then
            UserList(VictimUserIndex).Stats.MinHP = UserList(VictimUserIndex).Stats.MinHP - CInt(daño / 2)
            Call SendData(ToIndex, Userindex, 0, "||Golpeas con Segunda Arma a " & UserList(VictimUserIndex).Name & _
                                                 " por " & CInt(daño / 2) & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, VictimUserIndex, 0, "||Te ha Golpeado con su Segunda Arma " & UserList( _
                                                       Userindex).Name & " por " & CInt(daño / 2) & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Npclist(VictimNpcIndex).Stats.MinHP = Npclist(VictimNpcIndex).Stats.MinHP - CInt(daño / 2)
            Call SendData(ToIndex, Userindex, 0, "||Golpeas con segunda arma por " & CInt(daño / 2) & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, Userindex, 0, "||" & Npclist(VictimNpcIndex).Name & ": " & Npclist( _
                                                 VictimNpcIndex).Stats.MinHP & "/" & Npclist(VictimNpcIndex).Stats.MaxHP & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        Call SubirSkill(Userindex, DobleArma)
    Else
        Call SendData(ToIndex, Userindex, 0, "||No has podido golpear con la Segunda Arma." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)

    End If

ako:

    Exit Sub
fallo:
    Call LogError("dodoblearma " & Err.number & " D: " & Err.Description)

End Sub

Public Sub QuitarSta(ByVal Userindex As Integer, ByVal Cantidad As Integer)

    On Error GoTo fallo

    'pluto:6.8
    If UserList(Userindex).flags.Privilegios > 0 Then Exit Sub

    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - Cantidad

    If UserList(Userindex).Stats.MinSta < 0 Then UserList(Userindex).Stats.MinSta = 0

    If UserList(Userindex).Stats.MinSta = 0 And UserList(Userindex).flags.Angel > 0 Then
        '[gau]
        Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).flags.Angel, _
                            UserList(Userindex).OrigChar.Head, UserList(Userindex).Char.Heading, UserList( _
                                                                                                 Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, _
                            UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," _
                                                                             & 1 & "," & 0)
        UserList(Userindex).flags.Angel = 0
        UserList(Userindex).flags.Sed = 0
        UserList(Userindex).flags.Hambre = 0

    End If

    If UserList(Userindex).Stats.MinSta = 0 And UserList(Userindex).flags.Demonio > 0 Then
        '[gau]
        Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).flags.Demonio, _
                            UserList(Userindex).OrigChar.Head, UserList(Userindex).Char.Heading, UserList( _
                                                                                                 Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, _
                            UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," _
                                                                             & 1 & "," & 0)
        UserList(Userindex).flags.Demonio = 0
        UserList(Userindex).flags.Sed = 0
        UserList(Userindex).flags.Hambre = 0

    End If

    Exit Sub
fallo:
    Call LogError("quitarstamina " & Err.number & " D: " & Err.Description)

End Sub

Public Sub DoTalar(ByVal Userindex As Integer)

    On Error GoTo errhandler

    Dim suerte As Integer
    Dim res As Integer
    'pluto:2.12
    UserList(Userindex).Counters.IdleCount = 0
    'pluto:2.11
    'If MapInfo(UserList(UserIndex).pos.Map).Pk = False Then
    'Call SendData(ToIndex, UserIndex, 0, "||Está Prohibido talar en Ciudad." & FONTTYPENAMES.FONTTYPE_INFO)
    'Exit Sub
    'End If

    If UserList(Userindex).clase = "Leñador" Then
        Call QuitarSta(Userindex, EsfuerzoTalarLeñador)
    Else
        Call QuitarSta(Userindex, EsfuerzoTalarGeneral)

    End If

    If UserList(Userindex).Stats.UserSkills(Talar) <= 20 And UserList(Userindex).Stats.UserSkills(Talar) >= -1 Then
        suerte = 35
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 40 And UserList(Userindex).Stats.UserSkills(Talar) >= 21 Then
        suerte = 30
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 60 And UserList(Userindex).Stats.UserSkills(Talar) >= 41 Then
        suerte = 28
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 80 And UserList(Userindex).Stats.UserSkills(Talar) >= 61 Then
        suerte = 24
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 100 And UserList(Userindex).Stats.UserSkills(Talar) >= 81 Then
        suerte = 22
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 120 And UserList(Userindex).Stats.UserSkills(Talar) >= 101 _
           Then
        suerte = 20
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 140 And UserList(Userindex).Stats.UserSkills(Talar) >= 121 _
           Then
        suerte = 18
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 160 And UserList(Userindex).Stats.UserSkills(Talar) >= 141 _
           Then
        suerte = 15
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 180 And UserList(Userindex).Stats.UserSkills(Talar) >= 161 _
           Then
        suerte = 13
    ElseIf UserList(Userindex).Stats.UserSkills(Talar) <= 200 And UserList(Userindex).Stats.UserSkills(Talar) >= 181 _
           Then
        suerte = 10

    End If

    If UserList(Userindex).Stats.UserSkills(Talar) = 200 Then suerte = 7

    res = RandomNumber(1, suerte)

    If res < 6 Then
        Dim nPos As WorldPos
        Dim MiObj As obj

        If UserList(Userindex).clase = "Leñador" Then
            MiObj.Amount = RandomNumber(1, CInt(UserList(Userindex).Stats.ELV * 2))
        Else
            MiObj.Amount = 1

        End If

        If MiObj.Amount < 1 Then MiObj.Amount = 1
        MiObj.ObjIndex = Leña

        If Not MeterItemEnInventario(Userindex, MiObj) Then

            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        End If

        Call SendData(ToIndex, Userindex, 0, "G1")
        'pluto.2.4.1
        UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + (CInt((UserList(Userindex).Stats.ELV / 10) + _
                                                                              1) * MiObj.Amount)
        Call CheckUserLevel(Userindex)
        Call senduserstatsbox(Userindex)

    Else

        'Call SendData(ToIndex, UserIndex, 0, "G2")
    End If

    Call SubirSkill(Userindex, Talar)

    Exit Sub

errhandler:
    Call LogError("Error en DoTalar")

End Sub

Sub VolverCriminal(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).Faccion.ArmadaReal = 1 Then Exit Sub

    If UserList(Userindex).flags.Privilegios = 0 Then
        UserList(Userindex).Reputacion.BurguesRep = 0
        UserList(Userindex).Reputacion.NobleRep = 0
        UserList(Userindex).Reputacion.PlebeRep = 0
        'pluto:2.4
        'UserCiu = UserCiu - 1
        'UserCrimi = UserCrimi + 1

        'Call AddtoVar(UserList(Userindex).Reputacion.BandidoRep, vlASALTO, MAXREP)
        'If UserList(UserIndex).Faccion.ArmadaReal = 2 Then Call ExpulsarFaccionlegion(UserIndex)

    End If

    Exit Sub
fallo:
    Call LogError("volvercriminal " & Err.number & " D: " & Err.Description)

End Sub

Sub VolverCiudadano(ByVal Userindex As Integer)

    On Error GoTo fallo

    'pluto:hoy
    If UserList(Userindex).flags.Privilegios = 0 Then
        'If UserList(Userindex).Faccion.FuerzasCaos > 0 Then Call ExpulsarCaos(Userindex)

        'pluto:2.4
        'UserCiu = UserCiu + 1
        'UserCrimi = UserCrimi - 1

        UserList(Userindex).Reputacion.LadronesRep = 0
        UserList(Userindex).Reputacion.BandidoRep = 0
        UserList(Userindex).Reputacion.AsesinoRep = 0

        'Call AddtoVar(UserList(Userindex).Reputacion.PlebeRep, vlASALTO, MAXREP)

    End If

    Exit Sub
fallo:
    Call LogError("volverciudadano " & Err.number & " D: " & Err.Description)

End Sub

Public Sub DoPlayInstrumento(ByVal Userindex As Integer)

End Sub

Public Sub DoMineria(ByVal Userindex As Integer)

    On Error GoTo errhandler

    Dim suerte As Integer
    Dim res As Integer
    Dim metal As Integer
    'pluto:2.12
    UserList(Userindex).Counters.IdleCount = 0
    'pluto:2.11
    'If MapInfo(UserList(UserIndex).pos.Map).Pk = False Then
    'Call SendData(ToIndex, UserIndex, 0, "||Está Prohibido Minar en Ciudad." & FONTTYPENAMES.FONTTYPE_INFO)
    'Exit Sub
    'End If

    If UserList(Userindex).clase = "Minero" Then
        Call QuitarSta(Userindex, EsfuerzoExcavarMinero)
    Else
        Call QuitarSta(Userindex, EsfuerzoExcavarGeneral)

    End If

    If UserList(Userindex).Stats.UserSkills(Mineria) <= 20 And UserList(Userindex).Stats.UserSkills(Mineria) >= -1 Then
        suerte = 35
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 40 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           21 Then
        suerte = 30
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 60 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           41 Then
        suerte = 28
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 80 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           61 Then
        suerte = 24
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 100 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           81 Then
        suerte = 22
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 120 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           101 Then
        suerte = 20
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 140 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           121 Then
        suerte = 18
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 160 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           141 Then
        suerte = 15
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 180 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           161 Then
        suerte = 12
    ElseIf UserList(Userindex).Stats.UserSkills(Mineria) <= 200 And UserList(Userindex).Stats.UserSkills(Mineria) >= _
           181 Then
        suerte = 10

    End If

    If UserList(Userindex).Stats.UserSkills(Mineria) = 200 Then suerte = 7

    res = RandomNumber(1, suerte)
    Dim res2 As Integer

    If res <= 5 Then
        Dim MiObj As obj
        Dim nPos As WorldPos

        If UserList(Userindex).flags.TargetObj = 0 Then Exit Sub

        MiObj.ObjIndex = ObjData(UserList(Userindex).flags.TargetObj).MineralIndex
        'objeto diamante
        res2 = RandomNumber(1, 100)

        If UserList(Userindex).clase = "Minero" Then

            'nati: Si el usuario NO ESTÁ en minas fortaleza, minara por su nivel * 2.
            If Not UserList(Userindex).Pos.Map = 186 Then
                MiObj.Amount = RandomNumber(1, CInt(UserList(Userindex).Stats.ELV * 2))
            Else
                MiObj.Amount = RandomNumber(1, CInt(UserList(Userindex).Stats.ELV))

            End If

            'nati:            FIN
        Else
            MiObj.Amount = 1

        End If

        If MiObj.Amount < 1 Then MiObj.Amount = 1

        'pluto:6.0A
        If res2 = 25 Then
            MiObj.ObjIndex = 695
            MiObj.Amount = 1
        ElseIf res2 = 26 Then
            MiObj.ObjIndex = 1170
            MiObj.Amount = 1

        End If

        If Not MeterItemEnInventario(Userindex, MiObj) Then Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        Call SendData(ToIndex, Userindex, 0, "G5")
        'pluto.2.4.1
        UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + (CInt((UserList(Userindex).Stats.ELV / 10) + _
                                                                              1) * MiObj.Amount)
        Call CheckUserLevel(Userindex)
        Call senduserstatsbox(Userindex)

    Else
        Call SendData(ToIndex, Userindex, 0, "G6")

    End If

    Call SubirSkill(Userindex, Mineria)

    Exit Sub

errhandler:
    Call LogError("Error en Sub DoMineria")

End Sub

Public Sub DoMeditar(ByVal Userindex As Integer)

    On Error GoTo errhandler

    UserList(Userindex).Counters.IdleCount = 0

    Dim suerte As Integer
    Dim res As Integer
    Dim Cant As Integer

    If UserList(Userindex).Stats.MinMAN >= UserList(Userindex).Stats.MaxMAN Then
        Call SendData(ToIndex, Userindex, 0, "G7")
        Call SendData2(ToIndex, Userindex, 0, 54)
        Call SendData2(ToIndex, Userindex, 0, 15, UserList(Userindex).Pos.X & "," & UserList(Userindex).Pos.Y)
        UserList(Userindex).flags.Meditando = False
        UserList(Userindex).Char.FX = 0
        UserList(Userindex).Char.loops = 0
        'pluto:bug meditar
        Call SendData2(ToMap, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & _
                                                                          0 & "," & 0)
        Exit Sub

    End If

    If UserList(Userindex).Stats.UserSkills(Meditar) <= 20 And UserList(Userindex).Stats.UserSkills(Meditar) >= -1 Then
        suerte = 22
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 40 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           21 Then
        suerte = 20
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 60 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           41 Then
        suerte = 18
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 80 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           61 Then
        suerte = 16
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 100 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           81 Then
        suerte = 14
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 120 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           101 Then
        suerte = 12
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 140 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           121 Then
        suerte = 10
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 160 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           141 Then
        suerte = 8
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 180 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           161 Then
        suerte = 6
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) <= 200 And UserList(Userindex).Stats.UserSkills(Meditar) >= _
           181 Then
        suerte = 4
    ElseIf UserList(Userindex).Stats.UserSkills(Meditar) = 200 Then
        suerte = 3

    End If

    res = RandomNumber(1, suerte)

    If res = 1 Then
        Cant = Porcentaje(UserList(Userindex).Stats.MaxMAN, 3)
        Call AddtoVar(UserList(Userindex).Stats.MinMAN, Cant, UserList(Userindex).Stats.MaxMAN)
        Call SendData(ToIndex, Userindex, 0, "V5" & Cant)
        Call SendUserStatsMana(Userindex)
        Call SubirSkill(Userindex, Meditar)

    End If

    'pluto:2.5.0
    Exit Sub

errhandler:
    Call LogError("Error en Sub DoMeditar")

End Sub
