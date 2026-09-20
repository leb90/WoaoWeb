Attribute VB_Name = "Remort"

Public Sub DoRemort(raza As String, Userindex As Integer)

    On Error GoTo fallo

    Dim X As Integer

    'pluto:6.0A
    If UserList(Userindex).flags.Navegando > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||Deja de Navegar!." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If UserList(Userindex).flags.TomoPocion = True Or UserList(Userindex).flags.DuracionEfecto = True Then
        Call SendData(ToIndex, Userindex, 0, "||Espera que se pase el efecto del dope." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Or UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Or _
       UserList(Userindex).Invent.CascoEqpObjIndex > 0 Or UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||Desequipate todo." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If (UserList(Userindex).Stats.ELV < 57) Then
        Call SendData(ToIndex, Userindex, 0, "||Podrás hacer remort en la Temporada 2 de World of AO" & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If (UserList(Userindex).flags.Privilegios > 0) Then
        Call SendData(ToIndex, Userindex, 0, "||Dejate de joder, y atende los SOS." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If (UserList(Userindex).Remort = 1) Then
        Call SendData(ToIndex, Userindex, 0, "||Ya has hecho remort ;)" & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If (UserList(Userindex).GuildInfo.EsGuildLeader = 1) Then
        Call SendData(ToIndex, Userindex, 0, "||Un lider no puede abandonar su Clan" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'pluto:2.17
    If (UserList(Userindex).GuildInfo.GuildName <> "") Then
        Call SendData(ToIndex, Userindex, 0, "||Debes salir del Clan." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'pluto:6.9
    If UserList(Userindex).Stats.GLD > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||Deja tu oro en el Banco antes de hacer remort!!" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    Dim Name As String
    Name = UserList(Userindex).Name

    Select Case UCase$(raza)

    Case "ELIAN-LAL"
        UserList(Userindex).Remort = 1
        UserList(Userindex).Remorted = "Elian-LAL"
        UserList(Userindex).Stats.UserAtributos(Inteligencia) = UserList(Userindex).Stats.UserAtributos( _
                                                                Inteligencia) + 4
        UserList(Userindex).Stats.UserAtributos(Constitucion) = UserList(Userindex).Stats.UserAtributos( _
                                                                Constitucion) + 0

    Case "GORK-ROR"
        UserList(Userindex).Remort = 1
        UserList(Userindex).Remorted = "Gork-RoR"
        UserList(Userindex).Stats.UserAtributos(Inteligencia) = UserList(Userindex).Stats.UserAtributos( _
                                                                Inteligencia) + 0
        UserList(Userindex).Stats.UserAtributos(Constitucion) = UserList(Userindex).Stats.UserAtributos( _
                                                                Constitucion) + 4

    Case "DRAKON"
        UserList(Userindex).Remort = 1
        UserList(Userindex).Remorted = "Drakon"
        UserList(Userindex).Stats.UserAtributos(Inteligencia) = UserList(Userindex).Stats.UserAtributos( _
                                                                Inteligencia) + 2
        UserList(Userindex).Stats.UserAtributos(Constitucion) = UserList(Userindex).Stats.UserAtributos( _
                                                                Constitucion) + 2

    Case Else
        Call SendData(ToIndex, Userindex, 0, _
                      "||Raza desconocida, las razas posibles son: ELIAN-LAL, GORK-ROR, DRAKON" & "´" & _
                      FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End Select

    If (UserList(Userindex).Remort = 1) Then

        'pluto:2-3-04
        Call QuitarObjetos(882, 1, Userindex)

        For X = 1 To NUMSKILLS
            UserList(Userindex).Stats.UserSkills(X) = 0
        Next X

        'pluto:2-3-04 -----------------------------------
        For loopc = 1 To MAXUSERHECHIZOS
            UserList(Userindex).Stats.UserHechizos(loopc) = 0
        Next loopc

        Call LimpiarInventario(Userindex)
        Call DarCuerpoDesnudo(Userindex)
        '------------------------------------------------
        UserList(Userindex).Stats.MaxHP = 5 + UserList(Userindex).Stats.UserAtributos(Constitucion)
        UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP
        UserList(Userindex).Stats.MaxAGU = 200
        UserList(Userindex).Stats.MaxHam = 200
        UserList(Userindex).Stats.MaxSta = 5 + UserList(Userindex).Stats.UserAtributos(Agilidad)
        UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MaxSta

        If UserList(Userindex).clase = "Mago" Then
            UserList(Userindex).Stats.MaxMAN = 50 + UserList(Userindex).Stats.UserAtributos(Inteligencia)
            UserList(Userindex).Stats.MinMAN = 50 + UserList(Userindex).Stats.UserAtributos(Inteligencia)
        ElseIf UserList(Userindex).clase = "Clerigo" Or UserList(Userindex).clase = "Druida" Or UserList( _
               Userindex).clase = "Bardo" Or UserList(Userindex).clase = "Asesino" Or UserList(Userindex).clase = _
               "Pirata" Then
            UserList(Userindex).Stats.MaxMAN = 30
            UserList(Userindex).Stats.MinMAN = 30
        Else
            UserList(Userindex).Stats.MaxMAN = 0
            UserList(Userindex).Stats.MinMAN = 0

        End If

        UserList(Userindex).Stats.GLD = 0
        UserList(Userindex).Stats.MaxHIT = 3
        UserList(Userindex).Stats.MinHIT = 2
        UserList(Userindex).Stats.exp = 0
        'pluto:2.9.0
        UserList(Userindex).Stats.PClan = 0
        UserList(Userindex).GuildInfo.GuildPoints = 0
        'pluto:6.0
        UserList(Userindex).flags.Minotauro = 0
        'pluto:2.17
        UserList(Userindex).Stats.Elu = 900
        UserList(Userindex).Stats.LibrosUsados = 0

        'UserList(UserIndex).Stats.Elu = 1200 - ((UserList(UserIndex).Stats.ELV - 45) * 40)

        UserList(Userindex).Stats.ELV = 1
        UserList(Userindex).Stats.SkillPts = 10
        Call ResetFacciones(Userindex)
        UserList(Userindex).Reputacion.AsesinoRep = 0
        UserList(Userindex).Reputacion.BandidoRep = 0
        UserList(Userindex).Reputacion.BurguesRep = 0
        UserList(Userindex).Reputacion.LadronesRep = 0
        UserList(Userindex).Reputacion.NobleRep = 1000
        UserList(Userindex).Reputacion.PlebeRep = 30
        UserList(Userindex).Reputacion.Promedio = 30 / 6

        Call ResetGuildInfo(Userindex)

        Select Case UCase$(UserList(Userindex).raza)

        Case "ORCO"
            Call WarpUserChar(Userindex, Pobladoorco.Map, Pobladoorco.X, Pobladoorco.Y, True)

        Case "HUMANO"
            Call WarpUserChar(Userindex, Pobladohumano.Map, Pobladohumano.X, Pobladohumano.Y, True)

        Case "ABISARIO"
            Call WarpUserChar(Userindex, Pobladohumano.Map, Pobladohumano.X, Pobladohumano.Y, True)

        Case "ELFO"
            Call WarpUserChar(Userindex, Pobladoelfo.Map, Pobladoelfo.X, Pobladoelfo.Y, True)

        Case "ELFO OSCURO"
            Call WarpUserChar(Userindex, Pobladoelfo.Map, Pobladoelfo.X, Pobladoelfo.Y, True)

        Case "VAMPIRO"
            Call WarpUserChar(Userindex, Pobladovampiro.Map, Pobladovampiro.X, Pobladovampiro.Y, True)

        Case "ENANO"
            Call WarpUserChar(Userindex, Pobladoenano.Map, Pobladoenano.X, Pobladoenano.Y, True)

        Case "GNOMO"
            Call WarpUserChar(Userindex, Pobladoenano.Map, Pobladoenano.X, Pobladoenano.Y, True)

        Case "GOBLIN"
            Call WarpUserChar(Userindex, Pobladoenano.Map, Pobladoenano.X, Pobladoenano.Y, True)
            
        Case "TAUROS"
            Call WarpUserChar(Userindex, Pobladoenano.Map, Pobladoenano.X, Pobladoenano.Y, True)
            
        Case "LICANTROPOS"
            Call WarpUserChar(Userindex, Pobladoenano.Map, Pobladoenano.X, Pobladoenano.Y, True)
            
        Case "NOMUERTO"
            Call WarpUserChar(Userindex, Pobladoenano.Map, Pobladoenano.X, Pobladoenano.Y, True)

        End Select

        Call SendData(ToIndex, Userindex, 0, _
                      "!!Te has convertido en un REMORT, cuando vuelvas a entrar se habrán realizado los cambios necesarios en tu Pj.")

        Call CloseUser(Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("doremort " & Err.number & " D: " & Err.Description)

End Sub
