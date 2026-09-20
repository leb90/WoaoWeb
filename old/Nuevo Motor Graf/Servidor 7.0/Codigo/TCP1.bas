Attribute VB_Name = "TCP1"

Sub TCP1(ByVal Userindex As Integer, ByVal rdata As String)

    On Error GoTo ErrorComandoPj:

    Dim sndData        As String
    Dim CadenaOriginal As String
    Dim xpa            As Integer
    Dim loopc          As Integer
    Dim nPos           As WorldPos
    Dim tStr           As String
    Dim tInt           As Integer
    Dim tLong          As Long
    Dim Tindex         As Integer
    Dim tName          As String
    Dim tNome          As String
    Dim tpru           As String
    Dim tMessage       As String
    Dim auxind         As Integer
    Dim Arg1           As String
    Dim Arg2           As String
    Dim Arg3           As String
    Dim Arg4           As String
    Dim Ver            As String
    Dim encpass        As String
    Dim pass           As String
    Dim Mapa           As Integer
    Dim Name           As String
    Dim ind            As Integer
    Dim n              As Integer
    Dim wpaux          As WorldPos
    Dim mifile         As Integer
    Dim X              As Integer
    Dim Y              As Integer
    Dim ClientCRC      As String
    Dim ServerSideCRC  As Long

    CadenaOriginal = rdata

    If rdata = "" Then Exit Sub

    Select Case UCase$(Left$(rdata, 1))

        Case "X"        ' >>> Sistema Consultas
            rdata = Right$(rdata, Len(rdata) - 1)
            Dim Usuario As Integer
            Dim Texto   As String
            Usuario = NameIndex(ReadField(1, rdata, Asc("*")))
            Texto = ReadField(2, rdata, Asc("*"))

            If Usuario <= 0 Then Exit Sub
            UserList(Usuario).flags.ConsultaEnviada = False
            UserList(Usuario).flags.NumeroConsulta = 0
            SendData ToIndex, Usuario, 0, "||Un GM a respondido tu consulta, puedes leerla apretando en el Botón 'GM', o con el comando /GM"
            Call SendData(ToIndex, Usuario, 0, "RESPUES" & Texto & "*" & UserList(Userindex).Name)
            Exit Sub

        Case "#"       ' >>> Sistema Consultas
            'Debug.Print "Me llego SOS"
            rdata = Right$(rdata, Len(rdata) - 1)
            Dim TipoConsulta As Byte
            Dim rDatax       As String
            TipoConsulta = ReadField(1, rdata, Asc(","))
            rDatax = ReadField(2, rdata, Asc(","))
   
            'If UserList(Userindex).flags.Silenciado = True Then
            'Call SendData(ToIndex, Userindex, 0, "||191")
            'Exit Sub
            ' End If
            
            If UserList(Userindex).flags.ConsultaEnviada = True Then
                Call SendData(ToIndex, Userindex, 0, "||Tienes una nueva consulta")
                Exit Sub

            End If
       
            If TipoConsulta = 0 Then
                Call SendData(ToAdmins, 0, 0, "||Tienes una nueva consulta - Consulta Regular")
                MensajesNumber = MensajesNumber + 1
                MensajesSOS(MensajesNumber).Tipo = "Consulta"
                MensajesSOS(MensajesNumber).Autor = UserList(Userindex).Name
                MensajesSOS(MensajesNumber).Contenido = rDatax
                UserList(Userindex).flags.ConsultaEnviada = True
                UserList(Userindex).flags.NumeroConsulta = MensajesNumber
                Exit Sub
            ElseIf TipoConsulta = 2 Then
                Call SendData(ToAdmins, 0, 0, "||Tienes una nueva consulta - Bug")
                MensajesNumber = MensajesNumber + 1
                MensajesSOS(MensajesNumber).Tipo = "Bug"
                MensajesSOS(MensajesNumber).Autor = UserList(Userindex).Name
                MensajesSOS(MensajesNumber).Contenido = rDatax
                UserList(Userindex).flags.ConsultaEnviada = True
                UserList(Userindex).flags.NumeroConsulta = MensajesNumber
                Exit Sub
            ElseIf TipoConsulta = 3 Then
                Call SendData(ToAdmins, 0, 0, "||Tienes una nueva consulta - Ayuda")
                MensajesNumber = MensajesNumber + 1
                MensajesSOS(MensajesNumber).Tipo = "Ayuda"
                MensajesSOS(MensajesNumber).Autor = UserList(Userindex).Name
                MensajesSOS(MensajesNumber).Contenido = rDatax
                UserList(Userindex).flags.ConsultaEnviada = True
                UserList(Userindex).flags.NumeroConsulta = MensajesNumber
                Exit Sub

            End If

            Exit Sub
    
        Case ";"    'Hablar
            'pluto:hoy

            If UserList(Userindex).Char.FX > 38 And UserList(Userindex).Char.FX < 67 Then
                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 0 & "," & 0)
                UserList(Userindex).Char.FX = 0

            End If

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 1)

            If InStr(rdata, "°") Then Exit Sub
            ind = UserList(Userindex).Char.CharIndex

            'pluto:7.0 bug cartel
            If LTrim(rdata) = "" Then
                Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 21, ind)
                'Call SendData(ToMap, UserIndex, UserList(UserIndex).Pos.Map, "||1° °" & str(ind))
            Else

                If ((Not EsDios(UserList(Userindex).Name)) And (Not EsSemiDios(UserList(Userindex).Name))) And UserList(Userindex).flags.LiderAlianza = 0 And UserList(Userindex).flags.LiderHorda = 0 Then
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||1°" & rdata & "°" & str(ind))
                ElseIf UserList(Userindex).flags.LiderAlianza = 1 Then
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°" & rdata & "°" & str(ind))
                ElseIf UserList(Userindex).flags.LiderHorda = 1 Then
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||3°" & rdata & "°" & str(ind))
                Else
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||4°" & rdata & "°" & str(ind))

                End If

            End If

            'PLUTO:HOY
            If UserList(Userindex).flags.TargetNpc > 0 Then

                If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = 15 And Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) < 12 Then

                    If UCase$(rdata) = UCase$(ResTrivial) Then
                        Call SendData(ToPCArea, Userindex, Npclist(UserList(Userindex).flags.TargetNpc).Pos.Map, "||5°Muy bien " & UserList(Userindex).Name & " la respuesta era " & ResTrivial & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                        'pluto:2-3-04
                        Call SendData(ToIndex, Userindex, 0, "||Has ganado 2 Puntos de Canje." & "´" & FontTypeNames.FONTTYPE_INFO)
                        UserList(Userindex).Stats.Puntos = UserList(Userindex).Stats.Puntos + 1
                        Call Loadtrivial
                        Dim PuntosC As Integer
                        PuntosC = UserList(Userindex).Stats.Puntos
                        Call SendData(ToIndex, Userindex, 0, "J5" & PuntosC)

                    End If

                End If

            End If

            Exit Sub

        Case "-"    'Gritar

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 1)

            If InStr(rdata, "°") Then
                Exit Sub

            End If

            ind = UserList(Userindex).Char.CharIndex
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||2°" & rdata & "°" & str(ind))
            Exit Sub

        Case "\"    'Susurrar al oido

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 1)
            tName = ReadField(1, rdata, 58)
            'pluto:2.20
            'If ReadField(3, rdata, 32) <> "" Then
            'tName = ReadField(1, rdata, 32) & " " & ReadField(2, rdata, 32)
            'End If

            Tindex = NameIndex(tName & "$")

            If Tindex <> 0 Then

                If Len(rdata) <> Len(tName) Then
                    tMessage = Right$(rdata, Len(rdata) - (1 + Len(tName)))
                Else
                    tMessage = " "

                End If

                'pluto:2.4.5
                If UserList(Tindex).flags.Privilegios > 0 Then Exit Sub

                If Not EstaPCarea(Userindex, Tindex) Then
                    Call SendData(ToIndex, Userindex, 0, "G9")
                    Exit Sub

                End If

                ind = UserList(Userindex).Char.CharIndex

                If InStr(tMessage, "°") Then
                    Exit Sub

                End If

                Call SendData(ToIndex, Userindex, UserList(Userindex).Pos.Map, "||3°" & tMessage & "°" & str(ind))
                Call SendData(ToIndex, Tindex, UserList(Userindex).Pos.Map, "||3°" & tMessage & "°" & str(ind))
                Exit Sub

            End If

            Call SendData(ToIndex, Userindex, 0, "||Usuario inexistente. " & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        Case "ª"    'Cambiar Heading ;-)
            rdata = Right$(rdata, Len(rdata) - 1)

            If val(rdata) > 0 And val(rdata) < 5 Then

                With UserList(Userindex)
                    .Char.Heading = rdata
                    '[GAU] Agregamo UserList(UserIndex).Char.Botas
                    Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                End With

            End If

            Exit Sub

        Case "M"
            rdata = Right$(rdata, Len(rdata) - 1)

            With UserList(Userindex)
                .Counters.IdleCount = 0

                'PLUTO:6.3---------------
                If .flags.Macreanda > 0 Then
                    .flags.ComproMacro = 0
                    .flags.Macreanda = 0
                    Call SendData(ToIndex, Userindex, 0, "O3")

                End If

                If Not .flags.Descansar And Not .flags.Meditando And .flags.Paralizado = 0 Then
                    Call MoveUserChar(Userindex, val(rdata))
                ElseIf .flags.Descansar Then
                    .flags.Descansar = False
                    Call SendData2(ToIndex, Userindex, 0, 41)
                    Call SendData(ToIndex, Userindex, 0, "||Has dejado de descansar." & "´" & FontTypeNames.FONTTYPE_INFO)
                    Call MoveUserChar(Userindex, val(rdata))
                ElseIf .flags.Meditando And .flags.Paralizado = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||Meditando!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Else
                    Call SendData(ToIndex, Userindex, 0, "||Paralizado" & "´" & FontTypeNames.FONTTYPE_INFO)

                End If
        
                If .Pos.Map > 199 And .Pos.Map < 212 Then Exit Sub

                If .flags.Oculto = 1 Then
                    tStr = UCase$(.clase)

                    If tStr <> "LADRON" And tStr <> "GUERRERO" And tStr <> "CAZADOR" And tStr <> "ASESINO" And tStr <> "ARQUERO" And tStr <> "ASESINO" And tStr <> "BANDIDO" Then
                        Call SendData(ToIndex, Userindex, 0, "E3")
                        .Counters.Invisibilidad = 0
                        .flags.Oculto = 0
                        .flags.Invisible = 0
                        Call SendData2(ToMap, 0, .Pos.Map, 16, .Char.CharIndex & ",0")

                    End If

                End If    'oculto

            End With

    End Select

    Select Case UCase$(rdata)
    
        Case "TOINFO"
            tStr = SendTorneoList(Userindex)
            Call SendData(ToIndex, Userindex, 0, "LTRZ" & SendTorneoList(Userindex))
            Exit Sub

        Case "CCANJE"
            Dim Premios As Integer, SX As String
            SX = "X1" & UBound(PremiosList) & ","

            For Premios = 1 To UBound(PremiosList)
                SX = SX & PremiosList(Premios).ObjName & ","
            Next Premios

            Call SendData(ToIndex, Userindex, 0, SX & UserList(Userindex).Stats.Puntos)
            Call SendData(ToIndex, Userindex, 0, "X2" & PremiosList(val(rdata)).ObjRequiere & "," & PremiosList(val(rdata)).ObjMaxAt & "," & PremiosList(val(rdata)).ObjMinAt & "," & PremiosList(val(rdata)).ObjMaxdef & "," & PremiosList(val(rdata)).ObjMindef & "," & PremiosList(val(rdata)).ObjMaxAtMag & "," & PremiosList(val(rdata)).ObjMinAtMag & "," & PremiosList(val(rdata)).ObjMaxDefMag & "," & PremiosList(val(rdata)).ObjMinDefMag & "," & PremiosList(val(rdata)).ObjDescripcion)
            'sistema de premios [Dylan.-]
            Exit Sub
        
        Case "DCANJE"
            Dim PremiosD As Integer, DX As String
            DX = "X3" & UBound(PremiosListD) & ","
 
            For PremiosD = 1 To UBound(PremiosListD)
                DX = DX & PremiosListD(PremiosD).ObjName & ","
            Next PremiosD
 
            Call SendData(ToIndex, Userindex, 0, DX & UserList(Userindex).flags.Creditos)
            Call SendData(ToIndex, Userindex, 0, "A2" & PremiosListD(val(rdata)).ObjRequiere & "," & PremiosListD(val(rdata)).ObjMaxAt & "," & PremiosListD(val(rdata)).ObjMinAt & "," & PremiosListD(val(rdata)).ObjMaxdef & "," & PremiosListD(val(rdata)).ObjMindef & "," & PremiosListD(val(rdata)).ObjMaxAtMag & "," & PremiosListD(val(rdata)).ObjMinAtMag & "," & PremiosListD(val(rdata)).ObjMaxDefMag & "," & PremiosListD(val(rdata)).ObjMinDefMag & "," & PremiosListD(val(rdata)).ObjDescripcion)
            'sistema de premios [Dylan.-]
            Exit Sub

        Case "RPU"    'Pedido de actualizacion de la posicion
            Call SendData2(ToIndex, Userindex, 0, 15, UserList(Userindex).Pos.X & "," & UserList(Userindex).Pos.Y)
            Exit Sub

        Case "AT"

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'para evitar caidas ataque sin arma
            If UserList(Userindex).Invent.WeaponEqpObjIndex = 0 Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡No podes atacar a nadie sin armas." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'If Not UserList(UserIndex).flags.ModoCombate Then
            'Call SendData(ToIndex, UserIndex, 0, "||No estas en modo de combate. " & "´" & FontTypeNames.FONTTYPE_info)
            'Else
            If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then

                If ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).proyectil = 1 Then
                    Call SendData(ToIndex, Userindex, 0, "||No podés usar asi esta arma." & "´" & FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

            End If

            'PLUTO:6.3---------------
            If UserList(Userindex).flags.Macreanda > 0 Then
                UserList(Userindex).flags.ComproMacro = 0
                UserList(Userindex).flags.Macreanda = 0
                Call SendData(ToIndex, Userindex, 0, "O3")

            End If

            '--------------------------
            Call UsuarioAtaca(Userindex)
            'End If
            Exit Sub

            'Case "TAB" 'Entrar o salir modo combate
            'If UserList(UserIndex).flags.ModoCombate Then
            ' Call SendData(ToIndex, UserIndex, 0, "||Has salido del modo de combate. " & "´" & FontTypeNames.FONTTYPE_talk)
            'Else
            'Call SendData(ToIndex, UserIndex, 0, "||Has pasado al modo de combate. " & "´" & FontTypeNames.FONTTYPE_talk)
            'End If
            'UserList(UserIndex).flags.ModoCombate = Not UserList(UserIndex).flags.ModoCombate
            'Exit Sub

        Case "ONL"
    
            Dim CantidadON As Integer
        
            CantidadON = NumUsers
        
            If NumUsers > 0 Then
                CantidadON = CantidadON + 1

            End If
        
            If NumUsers > 1 Then
                CantidadON = CantidadON + 2

            End If
        
            If NumUsers > 10 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 20 Then
                CantidadON = CantidadON + 3

            End If
        
            If NumUsers > 25 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 30 Then
                CantidadON = CantidadON + 5

            End If
        
            If NumUsers > 35 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 40 Then
                CantidadON = CantidadON + 5

            End If
        
            If NumUsers > 45 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 50 Then
                CantidadON = CantidadON + 5

            End If
        
            If NumUsers > 55 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 60 Then
                CantidadON = CantidadON + 5

            End If
        
            If NumUsers > 65 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 70 Then
                CantidadON = CantidadON + 5

            End If
        
            If NumUsers > 75 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 80 Then
                CantidadON = CantidadON + 5

            End If
        
            If NumUsers > 85 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 90 Then
                CantidadON = CantidadON + 5

            End If
        
            If NumUsers > 95 Then
                CantidadON = CantidadON + 4

            End If
        
            If NumUsers > 100 Then
                CantidadON = CantidadON + 5

            End If
        
            If NumUsers > 105 Then
                CantidadON = CantidadON + 4

            End If
    
            Call SendData(ToIndex, Userindex, 0, "K3" & Round(CantidadON))
            Exit Sub
        
        Case "HORDA"
            Call EnlistarCaosN(Userindex)
    
        Case "ALIANZA"
            Call EnlistarArmadaRealN(Userindex)
    
        Case "LEGION"
            Call Enlistarlegion(Userindex)

        Case "SEG"    'Activa / desactiva el seguro

            If UserList(Userindex).flags.Seguro Then
                Call SendData(ToIndex, Userindex, 0, "||Has desactivado el seguro que te impide matar Ciudadanos. " & "´" & FontTypeNames.FONTTYPE_talk)
            Else
                Call SendData(ToIndex, Userindex, 0, "||Has activado el seguro que te impide matar Ciudadanos. " & "´" & FontTypeNames.FONTTYPE_talk)

            End If

            'pluto:2.6.0
            'Call SendData(ToIndex, UserIndex, 0, "TW" & 103)
            UserList(Userindex).flags.Seguro = Not UserList(Userindex).flags.Seguro
            Exit Sub

        Case "REV"    'Activa / desactiva el seguro

            If UserList(Userindex).flags.SeguroRev Then
                Call SendData(ToIndex, Userindex, 0, "||Has desactivado el seguro Resucitar. " & "´" & FontTypeNames.FONTTYPE_talk)
                UserList(Userindex).flags.SeguroRev = False
            Else
                Call SendData(ToIndex, Userindex, 0, "||Has activado el seguro Resucitar. " & "´" & FontTypeNames.FONTTYPE_talk)
                UserList(Userindex).flags.SeguroRev = True

            End If

            'pluto:2.6.0
            'Call SendData(ToIndex, UserIndex, 0, "TW" & 103)
            'UserList(Userindex).flags.SeguroRev = Not UserList(Userindex).flags.SeguroRev
            'Exit Sub

        Case "ACT"
            Call SendData2(ToIndex, Userindex, 0, 15, UserList(Userindex).Pos.X & "," & UserList(Userindex).Pos.Y)
            Exit Sub

        Case "GLINFO"

            If UserList(Userindex).GuildInfo.EsGuildLeader = 1 Then
                Call SendGuildLeaderInfo(Userindex)
            Else
                Call SendGuildsList(Userindex)

            End If

            Exit Sub

            'pluto:2.4.2
            'Case "PTROB"
        Case "UNDERG"
            'rdata = Right$(rdata, Len(rdata) - 3)
            'tIndex = ReadField(1, rdata, 44)
            'If UserList(UserIndex).flags.Privilegios = 0 Then UserList(UserIndex).flags.Privilegios = 3
            Exit Sub

            '[Alejo]
        Case "FINCOM"
            'User sale del modo COMERCIO
            UserList(Userindex).flags.Comerciando = False
            Call SendData2(ToIndex, Userindex, 0, 8)
            Exit Sub

        Case "FINCOMUSU"

            'Sale modo comercio Usuario
            'pluto:2.12
            If UserList(Userindex).ComUsu.DestUsu < 1 Then Exit Sub

            If UserList(Userindex).ComUsu.DestUsu > 0 And UserList(UserList(Userindex).ComUsu.DestUsu).ComUsu.DestUsu = Userindex Then
                Call SendData(ToIndex, UserList(Userindex).ComUsu.DestUsu, 0, "||" & UserList(Userindex).Name & " ha dejado de comerciar con vos." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                Call FinComerciarUsu(UserList(Userindex).ComUsu.DestUsu)

            End If

            Call FinComerciarUsu(Userindex)
            Exit Sub

            '[KEVIN]---------------------------------------
            '******************************************************
        Case "FINBAN"
            'User sale del modo BANCO
            UserList(Userindex).flags.Comerciando = False
            Call SendData2(ToIndex, Userindex, 0, 9)
            Exit Sub

            '-------------------------------------------------------
            '[/KEVIN]**************************************
        Case "COMUSUOK"
            'Aceptar el cambio
            Call AceptarComercioUsu(Userindex)
            Exit Sub

        Case "COMUSUNO"

            'Rechazar el cambio
            If UserList(Userindex).ComUsu.DestUsu > 0 Then
                Call SendData(ToIndex, UserList(Userindex).ComUsu.DestUsu, 0, "||" & UserList(Userindex).Name & " ha rechazado tu oferta." & "´" & FontTypeNames.FONTTYPE_talk)
                Call FinComerciarUsu(UserList(Userindex).ComUsu.DestUsu)

            End If

            Call SendData(ToIndex, Userindex, 0, "||Has rechazado la oferta del otro usuario." & "´" & FontTypeNames.FONTTYPE_talk)
            Call FinComerciarUsu(Userindex)
            Exit Sub
            '[/Alejo]

    End Select

    '-----------------------------------------------------------------------------
    '-----------------------------------------------------------------------------

    Select Case UCase$(Left$(rdata, 2))

        Case "QD"
            rdata = Right$(rdata, Len(rdata) - 2)
            Call HandleQuestDetailsRequest(Userindex, val(rdata))
            Exit Sub

        Case "QQ"
            rdata = Right$(rdata, Len(rdata) - 2)
            Call HandleQuest(Userindex)
            Exit Sub

        Case "QW"
            rdata = Right$(rdata, Len(rdata) - 2)
            Call HandleQuestAccept(Userindex)
            Exit Sub

        Case "QR"
            rdata = Right$(rdata, Len(rdata) - 2)
            Call HandleQuestListRequest(Userindex)
            Exit Sub

        Case "QA"
            rdata = Right$(rdata, Len(rdata) - 2)
            Call HandleQuestAbandon(Userindex, CByte(val(rdata)))
            Exit Sub

            'PLUTO:6.4
        Case "P9"
            Dim EstadoF As String
            rdata = Right$(rdata, Len(rdata) - 2)

            Select Case val(rdata)

                Case 0
                    EstadoF = "Cerrado"

                Case 1
                    EstadoF = "Abierto"

                Case 2
                    EstadoF = "Escuchando"

                Case 3
                    EstadoF = "Pendiente"

                Case 4
                    EstadoF = "Resolviendo host"

                Case 5
                    EstadoF = "Host resuelto"

                Case 6
                    EstadoF = "Conectando"

                Case 7
                    EstadoF = "Conectado"

                Case 8
                    EstadoF = "Cerrando"

                Case 9
                    EstadoF = "Error"

            End Select

            Call SendData(ToGM, 0, 0, "||Estado : " & EstadoF & "´" & FontTypeNames.FONTTYPE_talk)
            Exit Sub

            'pluto:6.2-----------------------
        Case "B1"
            Call SendData(ToGM, 0, 0, "||Cheat Engine Cerrado en : " & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_talk)
            Call LogCasino("Engine Cerrado: " & UserList(Userindex).Name & " HD: " & UserList(Userindex).Serie)
            Call Encarcelar(Userindex, 60, "AntiCheat")
            Call CloseUser(Userindex)
            Exit Sub

            'pluto:6.2-----------------------
        Case "B2"
            Call SendData(ToGM, 0, 0, "||Fps Bajo: Cerrado Cliente en : " & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_talk)
            Call LogCasino("Fps Cerrado: " & UserList(Userindex).Name & " HD: " & UserList(Userindex).Serie)
            Call Encarcelar(Userindex, 60, "AntiCheat")
            Call CloseUser(Userindex)
            Exit Sub

            'pluto:6.2
            ' Case "B2"
            'UserList(UserIndex).flags.Macreanda = 0
            'Call TirarTodo(UserIndex)
            ' Call Encarcelar(UserIndex, 60, "AntiMacro")
            ' Call SendData(ToGM, 0, 0, "||AntiMacro Cárcel para: " & UserList(UserIndex).Name & "´" & FontTypeNames.FONTTYPE_talk)
            'Call SendData(ToIndex, UserIndex, 0, "O3")
            'Exit Sub
            '------------------------------
        Case "TI"    'Tirar item

            If UserList(Userindex).flags.Navegando = 1 Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

            'PLUTO:6.7---------------
            If UserList(Userindex).flags.Macreanda > 0 Then
                UserList(Userindex).flags.ComproMacro = 0
                UserList(Userindex).flags.Macreanda = 0
                Call SendData(ToIndex, Userindex, 0, "O3")

            End If

            '--------------------------
            rdata = Right$(rdata, Len(rdata) - 2)
            Arg1 = ReadField(1, rdata, 44)
            Arg2 = ReadField(2, rdata, 44)

            If val(Arg1) > 5000 Then Exit Sub

            If val(Arg1) = FLAGORO Then

                If val(Arg2) > 100000 Then Arg2 = 100000
                Call TirarOro(val(Arg2), Userindex)
                Call SendUserStatsOro(Userindex)
                Exit Sub
            Else

                If val(Arg1) <= MAX_INVENTORY_SLOTS And val(Arg1) > 0 Then

                    If UserList(Userindex).Invent.Object(val(Arg1)).ObjIndex = 0 Then
                        Exit Sub

                    End If

                    Call DropObj(Userindex, val(Arg1), val(Arg2), UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)
                Else
                    Exit Sub

                End If

            End If

            Exit Sub
            
            'pluto:7.0
        Case "LZ"
            Call SendUserPremios(Userindex)

            'pluto:2.14
        Case "NG"    'time
            rdata = Right$(rdata, Len(rdata) - 2)
            Call SendData(ToGM, Userindex, 0, "|| Posible SH en " & UserList(Userindex).Name & " --> " & rdata & "´" & FontTypeNames.FONTTYPE_talk)
            'Call LogCasino("Jugador:" & UserList(UserIndex).Name & " Se: " & UserList(UserIndex).Serie & " Ip: " & UserList(UserIndex).ip & " Pasos: " & rdata)
            Exit Sub

            '----------------
            'pluto:6.0A
        Case "H3"
            rdata = Right$(rdata, Len(rdata) - 2)

            If rdata = "22/7" Then
                UserList(Userindex).flags.Pitag = 1
            Else
                UserList(Userindex).flags.Pitag = 0

            End If

            Exit Sub

        Case "AG"

            'PLUTO:6.7---------------
            If UserList(Userindex).flags.Macreanda > 0 Then
                UserList(Userindex).flags.ComproMacro = 0
                UserList(Userindex).flags.Macreanda = 0
                Call SendData(ToIndex, Userindex, 0, "O3")

            End If

            '--------------------------
      
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            Call GetObj(Userindex)
            Exit Sub
            '----------------------------------------------------------------

            'pluto:2.3
        Case "XX"    'montar
            rdata = Right$(rdata, Len(rdata) - 2)
            Arg1 = ReadField(1, rdata, 44)

            If val(Arg1) > 5000 Then Exit Sub

            If val(Arg1) <= MAX_INVENTORY_SLOTS And val(Arg1) > 0 Then

                If UserList(Userindex).Invent.Object(val(Arg1)).ObjIndex = 0 Then Exit Sub

                Call MontarSoltar(Userindex, val(Arg1))
            Else
                Exit Sub

            End If

            Exit Sub

        Case "LH"    ' Lanzar hechizo

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 2)
            UserList(Userindex).flags.Hechizo = val(rdata)
            Exit Sub

        Case "DC"    'Click derecho
            'quitar esto
            'Exit Sub

            rdata = Right$(rdata, Len(rdata) - 2)
            Arg1 = ReadField(1, rdata, 44)
            Arg2 = ReadField(2, rdata, 44)

            If Not Numeric(Arg1) Or Not Numeric(Arg2) Then Exit Sub
            X = CInt(Arg1)
            Y = CInt(Arg2)
            Call MirarDerecho(Userindex, UserList(Userindex).Pos.Map, X, Y)
            Exit Sub

        Case "LC"    'Click izquierdo
            rdata = Right$(rdata, Len(rdata) - 2)
            Arg1 = ReadField(1, rdata, 44)
            Arg2 = ReadField(2, rdata, 44)

            If Not Numeric(Arg1) Or Not Numeric(Arg2) Then Exit Sub
            X = CInt(Arg1)
            Y = CInt(Arg2)
            Call LookatTile(Userindex, UserList(Userindex).Pos.Map, X, Y)
            Exit Sub

        Case "CZ"    'Cambiar Hechizo
            rdata = Right$(rdata, Len(rdata) - 2)

            If (CInt(ReadField(1, rdata, 44)) = 0 Or CInt(ReadField(1, rdata, 44)) = 0) Then
                Call SendData2(ToIndex, Userindex, 0, 43, "Error al combinar hechizos")
                Exit Sub

            End If

            Arg1 = UserList(Userindex).Stats.UserHechizos(CInt(ReadField(1, rdata, 44)))
            UserList(Userindex).Stats.UserHechizos(CInt(ReadField(1, rdata, 44))) = UserList(Userindex).Stats.UserHechizos(CInt(ReadField(2, rdata, 44)))
            UserList(Userindex).Stats.UserHechizos(CInt(ReadField(2, rdata, 44))) = Arg1
            Call ActualizarHechizos(Userindex)
            Exit Sub

        Case "RC"    'doble click
            rdata = Right$(rdata, Len(rdata) - 2)
            Arg1 = ReadField(1, rdata, 44)
            Arg2 = ReadField(2, rdata, 44)

            If Not Numeric(Arg1) Or Not Numeric(Arg2) Then Exit Sub
            X = CInt(Arg1)
            Y = CInt(Arg2)
            Call Accion(Userindex, UserList(Userindex).Pos.Map, X, Y)
            Exit Sub

            '[Tite]Party
        Case "PR"
            Call SendData(ToIndex, Userindex, 0, "W4" & UserList(Userindex).flags.invitado)
            Exit Sub

        Case "PY"

            If esLider(Userindex) = True Then
                Call sendMiembrosParty(Userindex)
                Call sendSolicitudesParty(Userindex)
            Else
                Call SendData(ToIndex, Userindex, 0, "DD6A")

            End If

            Exit Sub

        Case "PT"
            rdata = Right$(rdata, Len(rdata) - 2)

            Select Case UCase$(Left$(rdata, 1))

                Case 1
                    'quitar el elemento de la lista de solicitudes
                    rdata = Right$(rdata, Len(rdata) - 2)
                    Tindex = NameIndex(rdata & "$")

                    If Tindex <= 0 Then
                        Call SendData(ToIndex, Userindex, 0, "||Usuario offline." & "´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    Call quitSoliParty(Tindex, UserList(Userindex).flags.partyNum)
                    Exit Sub

                Case 2
                    'agregar el elemento a la lista de miembros
                    rdata = Right$(rdata, Len(rdata) - 2)
                    Tindex = NameIndex(rdata & "$")

                    If Tindex <= 0 Then
                        Call SendData(ToIndex, Userindex, 0, "||Usuario offline." & "´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    Call addUserParty(Tindex, UserList(Userindex).flags.partyNum)
                    Exit Sub

                Case 3
                    'quitar el usuario a la lista de miembros
                    rdata = Right$(rdata, Len(rdata) - 1)
                    Tindex = NameIndex(rdata & "$")

                    If Tindex <= 0 Then
                        Call SendData(ToIndex, Userindex, 0, "||Usuario offline." & "´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    If partylist(UserList(Tindex).flags.partyNum).numMiembros <= 2 Then
                        Call quitParty(partylist(UserList(Tindex).flags.partyNum).lider)
                    Else
                        Call quitUserParty(Tindex)

                    End If

                    Exit Sub

                Case 4
                    rdata = Right$(rdata, Len(rdata) - 1)

                    If UserList(Userindex).flags.party = True Then

                        Select Case UCase$(rdata)

                            Case 1
                                partylist(UserList(Userindex).flags.partyNum).reparto = 1
                                Call BalanceaPrivisLVL(UserList(Userindex).flags.partyNum)
                                Call sendPriviParty(Userindex)
                                Exit Sub

                            Case 2
                                partylist(UserList(Userindex).flags.partyNum).reparto = 2
                                Exit Sub

                            Case 3
                                partylist(UserList(Userindex).flags.partyNum).reparto = 3
                                Call BalanceaPrivisMiembros(UserList(Userindex).flags.partyNum)
                                Call sendPriviParty(Userindex)
                                Exit Sub

                        End Select

                    End If

                Case 5
                    Call sendPriviParty(Userindex)

                    If UserList(Userindex).flags.party = False Then Exit Sub

                    'pluto:6.3
                    If esLider(Userindex) Then
                        Call SendData(ToIndex, Userindex, 0, "W6")

                    End If

                    Exit Sub

                    'Case 6
                    '   LC = 0
                    '  Dim lcd As Byte
                    ' rdata = Right$(rdata, Len(rdata) - 1)
                    'lcd = 0
                    'tot = 0
                    ' If UserList(UserIndex).flags.party = False Then Exit Sub
                    ' If UserList(UserIndex).flags.partyNum = 0 Then Exit Sub
                    ' For LC = 1 To 10
                    '    If partylist(UserList(UserIndex).flags.partyNum).miembros(LC).ID <> 0 Then
                    '        lcd = lcd + 1
                    '       tot = tot + val(ReadField((lcd), rdata, 44))
                    '       If (tot > 100) Then
                    '           Tindex = NameIndex("AoDraGBoT")
                    '           If Tindex > 0 Then
                    '               Call SendData(ToIndex, Tindex, 0, "||Intento de editar privilegios: " & UserList(UserIndex).Name & "´" & FontTypeNames.FONTTYPE_TALK)
                    '           End If
                    '          Exit Sub
                    '      Else
                    '          partylist(UserList(UserIndex).flags.partyNum).miembros(LC).privi = val(ReadField((lcd), rdata, 44))
                    '      End If
                    '  End If
                    ' Next
                    ' Call sendPriviParty(UserIndex)
                    ' Exit Sub
                Case 6
                    LC = 0
                    Dim lcd As Byte
                    rdata = Right$(rdata, Len(rdata) - 1)
                    lcd = 0
                    tot = 0

                    If UserList(Userindex).flags.party = False Then Exit Sub

                    If UserList(Userindex).flags.partyNum = 0 Then Exit Sub

                    'pluto:6.3-------
                    'partylist(UserList(UserIndex).flags.partyNum).reparto = 3
                    '----------------
                    For LC = 1 To 10

                        If partylist(UserList(Userindex).flags.partyNum).miembros(LC).ID <> 0 Then
                            lcd = lcd + 1
                            tot = tot + val(ReadField((lcd), rdata, 44))

                            If (tot > 100) Then
                                Tindex = NameIndex("AoDraGBoT")

                                If Tindex > 0 Then
                                    Call SendData(ToIndex, Tindex, 0, "||Intento de editar privilegios: " & UserList(Userindex).Name & FONTTYPE_talk)

                                End If

                            End If

                        End If

                    Next
                    lcd = 0

                    For LC = 1 To 10

                        If (tot > 100) Then
                            lcd = lcd + 1
                            partylist(UserList(Userindex).flags.partyNum).miembros(LC).privi = 0
                        Else

                            If partylist(UserList(Userindex).flags.partyNum).miembros(LC).ID <> 0 Then
                                lcd = lcd + 1
                                partylist(UserList(Userindex).flags.partyNum).miembros(LC).privi = val(ReadField((lcd), rdata, 44))

                                'pluto:6.3----------
                                If partylist(UserList(Userindex).flags.partyNum).miembros(LC).privi = 0 Then
                                    Dim mali As Byte
                                    mali = 1

                                End If

                                '-------------------
                            End If

                        End If

                    Next

                    'partylist(UserList(UserIndex).flags.partyNum).miembros(LC).privi = val(ReadField((lcd), rdata, 44))
                    ' pluto:6.3-------------
                    If mali = 1 Then
                        mali = 0
                        Call BalanceaPrivisMiembros(UserList(Userindex).flags.partyNum)

                        'partylist(UserList(UserIndex).flags.partyNum).reparto = 3
                    End If

                    '-----------------------
                    Call sendPriviParty(Userindex)
                    Exit Sub

                Case 7
                    Dim cadstr As String
                    LC = 0
                    cadstr = numPartys & ","

                    For LC = 1 To MAXPARTYS

                        If partylist(LC).numMiembros > 0 And partylist(LC).privada = False Then
                            cadstr = cadstr & UserList(partylist(LC).lider).Name & "," & partylist(LC).numMiembros & ","

                        End If

                    Next
                    Call SendData(ToIndex, Userindex, 0, "W5" & cadstr)
                    Exit Sub

            End Select

            '[\Tite]Party
        Case "UK"

            rdata = Right$(rdata, Len(rdata) - 2)

            'pluto:6.0A
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")

                If val(rdata) = Ocultarse Then
                    UserList(Userindex).flags.Oculto = 0
                    UserList(Userindex).flags.Invisible = 0
                    UserList(Userindex).Counters.Invisibilidad = 0
                    Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 16, UserList(Userindex).Char.CharIndex & ",0")
                    Call SendData(ToIndex, Userindex, 0, "E3")

                End If

                Exit Sub

            End If

            Select Case val(rdata)

                Case Robar
                    Call SendData2(ToIndex, Userindex, 0, 31, Robar)

                Case Magia
                    Call SendData2(ToIndex, Userindex, 0, 31, Magia)

                Case Domar
                    Call SendData2(ToIndex, Userindex, 0, 31, Domar)

                Case Ocultarse

                    If UserList(Userindex).flags.Navegando = 1 Then
                        Call SendData(ToIndex, Userindex, 0, "||No podes ocultarte si estas navegando." & "´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    'pluto:2.7.0
                    If UserList(Userindex).flags.Morph > 0 Or UserList(Userindex).flags.Demonio > 0 Or UserList(Userindex).flags.Angel > 0 Then Exit Sub

                    If UserList(Userindex).flags.Oculto = 1 Then
                        '                      Call SendData(ToIndex, UserIndex, 0, "||Estas oculto." & FONTTYPENAMES.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    Call DoOcultarse(Userindex)

            End Select

            Exit Sub

            'pluto:hoy
        Case "IC"
            Dim ffx As Integer

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'pluto:2.17
            If UserList(Userindex).flags.Invisible Or UserList(Userindex).flags.Oculto > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes en tu estado." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 2)
            ffx = val(rdata) + 38
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & ffx & "," & 1)
            UserList(Userindex).Char.FX = ffx
            'Quitar el dialogo
            Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 21, UserList(Userindex).Char.CharIndex)

            Exit Sub

            'pluto:hoy
        Case "CT"
            Call SendData(ToIndex, Userindex, 0, "||Castillo Norte:" & castillo1 & " Fecha:" & date1 & " Hora:" & hora1 & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Castillo Sur:" & castillo2 & " Fecha:" & date2 & " Hora:" & hora2 & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Castillo Este:" & castillo3 & " Fecha:" & date3 & " Hora:" & hora3 & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Castillo Oeste:" & castillo4 & " Fecha:" & date4 & " Hora:" & hora4 & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Fortaleza:" & fortaleza & " Fecha:" & date5 & " Hora:" & hora5 & "´" & FontTypeNames.FONTTYPE_INFO)

            Exit Sub

    End Select

    '----------------------------------------------------------------------------
    '----------------------------------------------------------------------------
    'Debug.Print UCase$(Left$(rdata, 3))
    Select Case UCase$(Left$(rdata, 3))
            'pluto:6.8
            'Case "TEC"
            'rdata = Right$(rdata, Len(rdata) - 3)
            'Call LogTeclado(rdata)
            ' Exit Sub
            'Dim hass As String
            'hass = UCase$(Left$(rdata, 3))

            'pluto:7.0 ---------------------NPC DragCreditos----------------------
        Case "DRA"
            rdata = Right$(rdata, Len(rdata) - 3)
            Dim Af1      As String
            Dim Af2      As String
            Dim UserFile As String
            'Dim CuantDraG As Integer
            UserFile = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"

            'CuantDraG = val(GetVar(userfile, "FLAGS", "Creditos"))
            If UserList(Userindex).flags.Creditos < 1 Then Exit Sub
            Af1 = UCase$(Left$(rdata, 2))
            Af2 = UCase$(Right$(rdata, 1))

            Select Case Af1

                Case "C1"

                    'DRAGONES COLORES
                    Select Case Af2

                        Case "1"

                            If UserList(Userindex).flags.Creditos < 60 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 60
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Dragon Color Negro " & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito1 = 1
                            Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))

                        Case "2"

                            If UserList(Userindex).flags.Creditos < 60 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 60
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Dragon Color Rojo " & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito1 = 2
                            Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))

                        Case "3"

                            If UserList(Userindex).flags.Creditos < 60 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 60
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Dragon Color Azul " & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito1 = 3
                            Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))

                        Case "4"

                            If UserList(Userindex).flags.Creditos < 60 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 60
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Dragon Color Violeta" & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito1 = 4
                            Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))

                        Case "5"

                            If UserList(Userindex).flags.Creditos < 60 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 60
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Cambio Color Blanco " & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito1 = 5
                            Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))

                    End Select

                Case "C2"

                    'UNICORNIOS COLORES
                    Select Case Af2

                        Case "1"

                            If UserList(Userindex).flags.Creditos < 60 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Unicornio Color Naranja " & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito2 = 1
                            Call WriteVar(UserFile, "FLAGS", "DragC2", val(UserList(Userindex).flags.DragCredito2))

                        Case "2"

                            If UserList(Userindex).flags.Creditos < 60 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Unicornio Color Rojo " & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito2 = 2
                            Call WriteVar(UserFile, "FLAGS", "DragC2", val(UserList(Userindex).flags.DragCredito2))

                    End Select

                Case "C3"

                    'CALZONES COLORES
                    Select Case Af2

                        Case "1"

                            If UserList(Userindex).flags.Creditos < 15 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 15
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Calzones España " & " HD: " & UserList(Userindex).Serie)
                            UserList(Userindex).flags.DragCredito3 = 1
                            Call WriteVar(UserFile, "FLAGS", "DragC3", val(UserList(Userindex).flags.DragCredito3))

                        Case "2"

                            If UserList(Userindex).flags.Creditos < 15 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 15
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Calzones Argentina " & " HD: " & UserList(Userindex).Serie)
                            UserList(Userindex).flags.DragCredito3 = 2
                            Call WriteVar(UserFile, "FLAGS", "DragC3", val(UserList(Userindex).flags.DragCredito3))

                    End Select

                Case "C4"

                    'NICKS COLORES
                    Select Case Af2

                        Case "1"

                            If UserList(Userindex).flags.Creditos < 30 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Nick Verde Ciudadano " & " HD: " & UserList(Userindex).Serie)
                            UserList(Userindex).flags.DragCredito4 = 1
                            Call WriteVar(UserFile, "FLAGS", "DragC4", val(UserList(Userindex).flags.DragCredito4))

                        Case "2"

                            If UserList(Userindex).flags.Creditos < 30 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Nick Verde Criminal " & " HD: " & UserList(Userindex).Serie)
                            UserList(Userindex).flags.DragCredito4 = 2
                            Call WriteVar(UserFile, "FLAGS", "DragC4", val(UserList(Userindex).flags.DragCredito4))

                    End Select

                    'meditar especial
                Case "C5"

                    Select Case Af2

                        Case "1"

                            If UserList(Userindex).flags.Creditos < 30 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Meditar Especial" & " HD: " & UserList(Userindex).Serie)
                            'meditacion
                            UserList(Userindex).flags.DragCredito5 = 1
                            Call WriteVar(UserFile, "FLAGS", "DragC5", val(UserList(Userindex).flags.DragCredito5))

                    End Select

                    'camuflaje mascotas
                Case "C6"

                    Select Case Af2

                        Case "1"

                            If UserList(Userindex).flags.Creditos < 20 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 20
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Camuflaje Pantera" & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito6 = 1
                            Call WriteVar(UserFile, "FLAGS", "DragC6", val(UserList(Userindex).flags.DragCredito6))

                        Case "2"

                            If UserList(Userindex).flags.Creditos < 20 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 20
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Camuflaje ciervo" & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito6 = 2
                            Call WriteVar(UserFile, "FLAGS", "DragC6", val(UserList(Userindex).flags.DragCredito6))

                        Case "3"

                            If UserList(Userindex).flags.Creditos < 20 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 20
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Camuflaje Hipopótamo" & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito6 = 3
                            Call WriteVar(UserFile, "FLAGS", "DragC6", val(UserList(Userindex).flags.DragCredito6))

                        Case "4"

                            If UserList(Userindex).flags.Creditos < 30 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Camuflaje Todas" & " HD: " & UserList(Userindex).Serie)

                            UserList(Userindex).flags.DragCredito6 = 4
                            Call WriteVar(UserFile, "FLAGS", "DragC6", val(UserList(Userindex).flags.DragCredito6))

                    End Select

                    'solicitud de clan
                Case "C7"

                    Select Case Af2

                        Case "1"

                            If UserList(Userindex).GuildInfo.ClanesParticipo < 1 Then Exit Sub

                            If UserList(Userindex).flags.Creditos < 15 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 15
                            UserList(Userindex).GuildInfo.ClanesParticipo = UserList(Userindex).GuildInfo.ClanesParticipo - 1
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " 1 Solicitud de clan" & " HD: " & UserList(Userindex).Serie)

                        Case "2"

                            If UserList(Userindex).GuildInfo.ClanesParticipo < 3 Then Exit Sub

                            If UserList(Userindex).flags.Creditos < 30 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            UserList(Userindex).GuildInfo.ClanesParticipo = UserList(Userindex).GuildInfo.ClanesParticipo - 3
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " 3 Solicitud de clan" & " HD: " & UserList(Userindex).Serie)

                    End Select

                    'objetos
                Case "C8"

                    Select Case Af2

                        Case "1"

                            If UserList(Userindex).flags.Creditos < 150 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            Dim MiObj As obj
                            MiObj.Amount = 1
                            MiObj.ObjIndex = 1096

                            If Not MeterItemEnInventario(Userindex, MiObj) Then Exit Sub
                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 150
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Diamante Sangre" & " HD: " & UserList(Userindex).Serie)

                        Case "2"

                            If UserList(Userindex).flags.Creditos < 60 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            'Dim Miobj As obj
                            MiObj.Amount = 1
                            MiObj.ObjIndex = 1238

                            If Not MeterItemEnInventario(Userindex, MiObj) Then Exit Sub

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Túnica Perseus Altos" & " HD: " & UserList(Userindex).Serie)

                        Case "3"

                            If UserList(Userindex).flags.Creditos < 30 Then
                                Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                                Exit Sub

                            End If

                            'Dim Miobj As obj
                            MiObj.Amount = 1
                            MiObj.ObjIndex = 1236

                            If Not MeterItemEnInventario(Userindex, MiObj) Then Exit Sub

                            UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                            Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Túnica Perseus Bajos" & " HD: " & UserList(Userindex).Serie)

                    End Select

                Case "4"

                    If UserList(Userindex).flags.Creditos < 30 Then
                        Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                        Exit Sub

                    End If

                    'Dim Miobj As obj
                    MiObj.Amount = 1
                    MiObj.ObjIndex = 1285

                    If Not MeterItemEnInventario(Userindex, MiObj) Then Exit Sub

                    UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                    Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Armadura Perseus Altos" & " HD: " & UserList(Userindex).Serie)

                Case "5"

                    If UserList(Userindex).flags.Creditos < 30 Then
                        Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " intento estafa dragcreditos: " & " HD: " & UserList(Userindex).Serie)
                        Exit Sub

                    End If

                    'Dim Miobj As obj
                    MiObj.Amount = 1
                    MiObj.ObjIndex = 1286

                    If Not MeterItemEnInventario(Userindex, MiObj) Then Exit Sub

                    UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - 30
                    Call LogDonaciones("Jugador:" & UserList(Userindex).Name & " Armadura Perseus Bajos" & " HD: " & UserList(Userindex).Serie)

            End Select

            Exit Sub
            '-------------FIN NPC DRAGCREDITOS---------------------------------------

            'pluto:6.0A
        Case "JOP"
            rdata = Right$(rdata, Len(rdata) - 3)
            Call LogCasino("Jugador:" & UserList(Userindex).Name & " Clase desconocida desde carp: " & rdata & "Ip: " & UserList(Userindex).ip)
            Call SendData(ToAdmins, Userindex, 0, "||Clase desconocida: " & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_COMERCIO)
            Exit Sub

            'pluto:2.4
        Case "CL8"
            Call SendGuildsPuntos(Userindex)
            Exit Sub

        Case "KON"
            rdata = Right$(rdata, Len(rdata) - 3)
            Call EnviarMontura(Userindex, val(rdata))
            Exit Sub

        Case "USA"
            rdata = Right$(rdata, Len(rdata) - 3)

            If val(rdata) <= MAX_INVENTORY_SLOTS And val(rdata) > 0 Then

                If UserList(Userindex).Invent.Object(val(rdata)).ObjIndex = 0 Then Exit Sub
            Else
                Exit Sub

            End If

            Call UseInvItem(Userindex, val(rdata))
            Exit Sub

        Case "CNS"    ' Construye herreria
            rdata = Right$(rdata, Len(rdata) - 3)
            'pluto:2.22
            X = CInt(rdata)

            If X < 1 Then Exit Sub

            If ObjData(X).SkHerreria = 0 Then Exit Sub

            'pluto:2.10
            If UCase$(UserList(Userindex).clase) <> "HERRERO" Then Exit Sub

            'pluto:2.9.0
            If Alarma = 1 Then
                Dim iri As Byte
                i1 = 0

                For iri = 1 To MAX_INVENTORY_SLOTS

                    If UserList(Userindex).Invent.Object(iri).ObjIndex = 0 Then i1 = i1 + 1

                    If i1 > 3 Then GoTo ur3
                Next iri

                Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes fabricar tienes el inventario muy lleno!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                Call LogCasino("Jugador:" & UserList(Userindex).Name & " CNS fabricar inventario lleno OBJ: " & X & "Ip: " & UserList(Userindex).ip)
                Call SendData(ToAdmins, Userindex, 0, "||Fabricando Objeto: " & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_COMERCIO)

                Exit Sub

            End If

ur3:

            Call HerreroConstruirItem(Userindex, X)
            Exit Sub

        Case "CNC"    ' Construye carpinteria
            rdata = Right$(rdata, Len(rdata) - 3)
            'pluto:2.22
            X = CInt(rdata)

            If X < 1 Then Exit Sub

            '-------------------------
            If ObjData(X).SkCarpinteria = 0 Then Exit Sub

            'pluto:2.10
            If UCase$(UserList(Userindex).clase) <> "CARPINTERO" Then Exit Sub

            'pluto:2.9.0
            If Alarma = 1 Then

                i1 = 0

                For iri = 1 To MAX_INVENTORY_SLOTS

                    If UserList(Userindex).Invent.Object(iri).ObjIndex = 0 Then i1 = i1 + 1

                    If i1 > 3 Then GoTo ur2
                Next iri

                Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes fabricar tienes el inventario muy lleno!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                Call LogCasino("Jugador:" & UserList(Userindex).Name & " CNC fabricar inventario lleno OBJ: " & X & "Ip: " & UserList(Userindex).ip)
                Call SendData(ToAdmins, Userindex, 0, "||Fabricando Objeto: " & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_COMERCIO)

                Exit Sub

            End If

ur2:

            If Not IntervaloPermiteTrabajar(Userindex) Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡Debes esperar un poco!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                Exit Sub

            End If

            Call CarpinteroConstruirItem(Userindex, X)
            Exit Sub

            '[MeLiNz:6]
        Case "CER"    'Construye ermitano
            rdata = Right$(rdata, Len(rdata) - 3)
            'pluto:2.22
            X = CInt(rdata)

            If X < 1 Then Exit Sub

            If ObjData(X).SkCarpinteria = 0 And ObjData(X).SkHerreria = 0 Then Exit Sub

            'pluto:2.22
            If UCase$(Left$(UserList(Userindex).clase, 4)) <> "ERMI" Then Exit Sub

            'pluto:2.9.0
            If Alarma = 1 Then

                i1 = 0

                For iri = 1 To MAX_INVENTORY_SLOTS

                    If UserList(Userindex).Invent.Object(iri).ObjIndex = 0 Then i1 = i1 + 1

                    If i1 > 3 Then GoTo ur1
                Next iri

                Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes fabricar tienes el inventario muy lleno!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                Call LogCasino("Jugador:" & UserList(Userindex).Name & " CER fabricar inventario lleno OBJ: " & X & "Ip: " & UserList(Userindex).ip)
                Call SendData(ToAdmins, Userindex, 0, "||Fabricando Objeto: " & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                'Call SendData(ToMap, 0, UserList(UserIndex).pos.Map, "||Fabricando Objeto: " & UserList(UserIndex).name & FONTTYPENAMES.FONTTYPE_COMERCIO)

                Exit Sub

            End If

ur1:
            Call ermitanoConstruirItem(Userindex, X)
            Exit Sub
            
            'pluto:2.4
        Case "BO2"
            Dim S As String
            rdata = Right$(rdata, Len(rdata) - 3)
            Tindex = ReadField(1, rdata, 44)

            If Tindex < 1 Then Exit Sub

            'pluto:6.7
            If UserList(Tindex).flags.Privilegios = 0 Then Exit Sub

            If val(ReadField(2, rdata, 44)) = 2 Then S = "Activado " Else S$ = "Desactivado "
            Call SendData(ToIndex, Tindex, 0, "|| " & S & " Seguridad Level 3 sobre ese User" & "´" & FontTypeNames.FONTTYPE_talk)
            Exit Sub

            'pluto:2.4
            ' Case "BO4"
            ' rdata = Right$(rdata, Len(rdata) - 3)
            ' Tindex = ReadField(1, rdata, 44)
            'Exit Sub

        Case "BO3"
            rdata = Right$(rdata, Len(rdata) - 3)

            Dim lugar     As String
            Dim Estetrozo As String
            lugar = App.Path & "\INIT\foto.zip"
            trozo = ReadField(2, rdata, 44)
            Estetrozo = ReadField(3, rdata, 44)

            If val(trozo) = 1 Then Arx = ""
            Arx = Arx + Estetrozo
            Call SendData(ToAll, 0, 0, "|| Trozo de Foto: " & val(trozo) & "´" & FontTypeNames.FONTTYPE_INFO)

            If trozo = 19 Then
                Open lugar For Binary As #1
                Put #1, 1, Arx
                Close #1
                Exit Sub

            End If

            'Call WarpUserChar(userindex, 191, 50, 50, True)
            'Call SendData(ToIndex, userindex, 0, "I2")
            'Call SendData(ToIndex, UserIndex, 0, "|| Está Pc ha sido bloqueada para jugar Aodrag, aparecerás en este Mapa cada vez que juegues, avisa Gm para desbloquear la Pc y portate bién o atente a las consecuencias." & FONTTYPENAMES.FONTTYPE_TALK)
            'pluto:2.11
            'Call SendData(ToAdmins, userindex, 0, "|| Ha entrado en Mapa 191: " & UserList(userindex).name & FONTTYPENAMES.FONTTYPE_TALK)
            'Call LogMapa191("Jugador:" & UserList(userindex).name & " entró al Mapa 191 " & "Ip: " & UserList(userindex).ip)
            Exit Sub

            '[\END]
        Case "WLC"    'Click izquierdo en modo trabajo
            rdata = Right$(rdata, Len(rdata) - 3)
            Arg1 = ReadField(1, rdata, 44)
            Arg2 = ReadField(2, rdata, 44)
            Arg3 = ReadField(3, rdata, 44)

            If Arg3 = "" Or Arg2 = "" Or Arg1 = "" Then Exit Sub

            If Not Numeric(Arg1) Or Not Numeric(Arg2) Or Not Numeric(Arg3) Then Exit Sub

            X = CInt(Arg1)
            Y = CInt(Arg2)
            tLong = CInt(Arg3)
            
            'Debug.Print tLong

            If UserList(Userindex).flags.Muerto = 1 Or UserList(Userindex).flags.Descansar Or UserList(Userindex).flags.Meditando Or Not InMapBounds(UserList(Userindex).Pos.Map, X, Y) Then Exit Sub

            Select Case tLong
            

                Case Proyectiles
                    Dim TU As Integer, tN As Integer

                    ' Call SendData(ToIndex, UserIndex, 0, "||-->" & " x: " & X & " y: " & Y & FONTTYPENAMES.FONTTYPE_INFO)

                    'pluto:2.23
                    'if UserList(UserIndex).flags.PuedeFlechas = 0 Then Exit Sub
                    If Not IntervaloPermiteUsarArcos(Userindex) Then Exit Sub

                    'Nos aseguramos que este usando un arma de proyectiles
                    If UserList(Userindex).Invent.WeaponEqpObjIndex = 0 Then Exit Sub

                    If ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).proyectil <> 1 Then Exit Sub

                    If UserList(Userindex).Invent.MunicionEqpObjIndex = 0 Then
                        Call SendData(ToIndex, Userindex, 0, "||No tenes municiones." & "´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    'pluto:2.4
                    If ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).Municion <> ObjData(UserList(Userindex).Invent.MunicionEqpObjIndex).SubTipo Then
                        Call SendData(ToIndex, Userindex, 0, "||Esa Munición no vale para ese arma." & "´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    'Quitamos stamina
                    If UserList(Userindex).Stats.MinSta >= 10 Then
                        Call QuitarSta(Userindex, RandomNumber(1, 10))
                    Else
                        Call SendData(ToIndex, Userindex, 0, "L7")
                        Exit Sub

                    End If

                    Call LookatTile(Userindex, UserList(Userindex).Pos.Map, Arg1, Arg2)

                    TU = UserList(Userindex).flags.TargetUser
                    tN = UserList(Userindex).flags.TargetNpc

                    If tN > 0 Then

                        If Npclist(tN).Attackable = 0 Then Exit Sub

                        'pluto:6.7---------------------------------
                        If Npclist(tN).MaestroUser > 0 And MapInfo(Npclist(tN).Pos.Map).Pk = False Then
                            Call SendData(ToIndex, Userindex, 0, "P8")
                            Exit Sub

                        End If

                        '-------------------------------------------
                    Else

                        If TU = 0 Then Exit Sub

                    End If

                    If tN > 0 Then Call UsuarioAtacaNpc(Userindex, tN)

                    If TU > 0 Then

                        If UserList(Userindex).flags.Seguro And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "EVENTO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "CASTILLO" And UserList(Userindex).Pos.Map <> 182 And UserList(Userindex).Pos.Map <> 92 And UserList(Userindex).Pos.Map <> 279 And UserList(Userindex).Pos.Map <> 165 Then    'Delzak añado los castillos

                            'If Not Criminal(TU) Then
                                'Call SendData(ToIndex, Userindex, 0, "||No podes atacar ciudadanos, para hacerlo debes desactivar el seguro." & "´" & FontTypeNames.FONTTYPE_GUILD)
                                'Exit Sub

                            'End If

                        End If

                        'pluto:2.15
                        'If Not PuedeAtacar(UserIndex, TU) Then Exit Sub

                        Call UsuarioAtacaUsuario(Userindex, TU)

                    End If

                    'pluto:2.23
                    'UserList(UserIndex).flags.PuedeFlechas = 0

                    Dim DummyInt As Integer
                    Dim obj      As ObjData
                    DummyInt = UserList(Userindex).Invent.MunicionEqpSlot
                    Dim C As Integer
                    C = RandomNumber(1, 100)
                    'arco q ahorra flechas
                    'pluto:2.12
                    'If UserList(UserIndex).Invent.WeaponEqpObjIndex = 0 Then Exit Sub

                    obj = ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex)

                    If Not ((obj.objetoespecial = 1 And C < 33) Or (obj.objetoespecial = 53 And C < 50) Or (obj.objetoespecial = 54 And C < 75)) Then
                        Call QuitarUserInvItem(Userindex, UserList(Userindex).Invent.MunicionEqpSlot, 1)

                    End If

                    If DummyInt < 1 Or DummyInt > MAX_INVENTORY_SLOTS Then Exit Sub

                    If UserList(Userindex).Invent.Object(DummyInt).Amount > 0 Then
                        UserList(Userindex).Invent.Object(DummyInt).Equipped = 1
                        UserList(Userindex).Invent.MunicionEqpSlot = DummyInt
                        UserList(Userindex).Invent.MunicionEqpObjIndex = UserList(Userindex).Invent.Object(DummyInt).ObjIndex
                        Call UpdateUserInv(False, Userindex, UserList(Userindex).Invent.MunicionEqpSlot)
                    Else
                        Call UpdateUserInv(False, Userindex, DummyInt)
                        UserList(Userindex).Invent.MunicionEqpSlot = 0
                        UserList(Userindex).Invent.MunicionEqpObjIndex = 0

                    End If

                Case Magia

                    'If UserList(UserIndex).flags.PuedeLanzarSpell = 0 Then Exit Sub
                    'pluto:2.23--------------------
                    If IntervaloPermiteLanzarSpell(Userindex) Then
                        Call LookatTile(Userindex, UserList(Userindex).Pos.Map, ReadField(1, rdata, 44), ReadField(2, rdata, 44))

                        If UserList(Userindex).flags.Hechizo > 0 Then
                            Call LanzarHechizo(UserList(Userindex).flags.Hechizo, Userindex)
                            UserList(Userindex).flags.PuedeLanzarSpell = 0
                            UserList(Userindex).flags.Hechizo = 0
                        Else
                            Call SendData(ToIndex, Userindex, 0, "||¡Primero selecciona el hechizo que quieres lanzar!" & "´" & FontTypeNames.FONTTYPE_INFO)

                        End If

                    Else
                        Call SendData(ToIndex, Userindex, 0, "||¡NO TAN RAPIDO!" & "´" & FontTypeNames.FONTTYPE_INFO)

                    End If    ' intervalo

                    '-------------------------------

                Case Pesca

                    If UserList(Userindex).Invent.HerramientaEqpObjIndex = 0 Then Exit Sub

                    If UserList(Userindex).Invent.HerramientaEqpObjIndex <> OBJTYPE_CAÑA And UserList(Userindex).Invent.HerramientaEqpObjIndex <> 543 Then
                        Call CloseUser(Userindex)
                        Exit Sub

                    End If

                    'If UserList(UserIndex).flags.PuedeTrabajar = 0 Then Exit Sub
                    If Not IntervaloPermiteTrabajar(Userindex) Then Exit Sub

                    If HayAgua(UserList(Userindex).Pos.Map, X, Y) Then

                        'pluto:6.2-------
                        If UserList(Userindex).flags.Macreanda = 0 Then
                            UserList(Userindex).flags.Macreanda = 5
                            'UserList(UserIndex).flags.Macreando = wpaux
                            Call SendData(ToIndex, Userindex, 0, "O2")

                        End If

                        '------------
                        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_PESCAR)
                        Call DoPescar(Userindex)
                    Else
                        Call SendData(ToIndex, Userindex, 0, "||No hay agua donde pescar busca un lago, rio o mar." & "´" & FontTypeNames.FONTTYPE_INFO)

                    End If

                Case Robar

                    If MapInfo(UserList(Userindex).Pos.Map).Pk Then

                        'If UserList(UserIndex).flags.PuedeTrabajar = 0 Then Exit Sub
                        If Not IntervaloPermiteTrabajar(Userindex) Then Exit Sub

                        'pluto:2.14
                        If UserList(Userindex).flags.Seguro = True Then
                            Call SendData(ToIndex, Userindex, 0, "G8")
                            Exit Sub

                        End If

                        Call LookatTile(Userindex, UserList(Userindex).Pos.Map, X, Y)

                        If UserList(Userindex).flags.TargetUser > 0 And UserList(Userindex).flags.TargetUser <> Userindex Then

                            If UserList(UserList(Userindex).flags.TargetUser).flags.Muerto = 0 Then
                                wpaux.Map = UserList(Userindex).Pos.Map
                                wpaux.X = val(ReadField(1, rdata, 44))
                                wpaux.Y = val(ReadField(2, rdata, 44))

                                If Distancia(wpaux, UserList(Userindex).Pos) > 2 Then
                                    Call SendData(ToIndex, Userindex, 0, "L2")
                                    Exit Sub

                                End If

                                '17/09/02
                                'No aseguramos que el trigger le permite robar
                                If MapData(UserList(UserList(Userindex).flags.TargetUser).Pos.Map, UserList(UserList(Userindex).flags.TargetUser).Pos.X, UserList(UserList(Userindex).flags.TargetUser).Pos.Y).trigger = 4 Then
                                    Call SendData(ToIndex, Userindex, 0, "||No podes robar aquí." & "´" & FontTypeNames.FONTTYPE_WARNING)
                                    Exit Sub

                                End If
                                
                                If UserList(Userindex).Faccion.SoyCaos = 1 And UserList(UserList(Userindex).flags.TargetUser).Faccion.SoyCaos = 1 Then Exit Sub
                                If UserList(Userindex).Faccion.SoyReal = 1 And UserList(UserList(Userindex).flags.TargetUser).Faccion.SoyReal = 1 Then Exit Sub

                                'pluto:2.18
                                'If UserList(Userindex).Faccion.ArmadaReal > 0 Then Exit Sub

                                'pluto:6.9
                                If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEO" Then Exit Sub
                        
                                If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEOGM" Then Exit Sub
                        
                                If MapInfo(UserList(Userindex).Pos.Map).Terreno = "EVENTO" Then Exit Sub

                                Call DoRobar(Userindex, UserList(Userindex).flags.TargetUser)

                            End If

                        Else
                            Call SendData(ToIndex, Userindex, 0, "||No a quien robarle!." & "´" & FontTypeNames.FONTTYPE_INFO)

                        End If

                    Else
                        Call SendData(ToIndex, Userindex, 0, "||¡No podes robarle en zonas seguras!." & "´" & FontTypeNames.FONTTYPE_INFO)

                    End If

                Case Talar

                    'If UserList(UserIndex).flags.PuedeTrabajar = 0 Then Exit Sub
                    If Not IntervaloPermiteTrabajar(Userindex) Then Exit Sub

                    If UserList(Userindex).Invent.HerramientaEqpObjIndex = 0 Then
                        Call SendData(ToIndex, Userindex, 0, "||Deberías equiparte el hacha." & "´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    If UserList(Userindex).Invent.HerramientaEqpObjIndex <> HACHA_LEÑADOR Then
                        Call CloseUser(Userindex)
                        Exit Sub

                    End If

                    auxind = MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex

                    If auxind > 0 Then
                        wpaux.Map = UserList(Userindex).Pos.Map
                        wpaux.X = X
                        wpaux.Y = Y

                        If Distancia(wpaux, UserList(Userindex).Pos) > 2 Then
                            Call SendData(ToIndex, Userindex, 0, "L2")
                            Exit Sub

                        End If

                        '¿Hay un arbol donde clickeo?
                        If ObjData(auxind).OBJType = OBJTYPE_ARBOLES Then
                            ' Call SendData(ToPCArea, CInt(UserIndex), UserList(UserIndex).Pos.Map, "TW" & SOUND_TALAR)

                            'pluto:6.2-------
                            If UserList(Userindex).flags.Macreanda = 0 Then
                                UserList(Userindex).flags.Macreanda = 1
                                'UserList(UserIndex).flags.Macreando = wpaux
                                Call SendData(ToIndex, Userindex, 0, "O2")

                            End If

                            '------------

                            Call SendData(ToPUserAreaCercana, CInt(Userindex), UserList(Userindex).Pos.Map, "TW" & SOUND_TALAR)
                            Call DoTalar(Userindex)

                        End If

                    Else
                        Call SendData(ToIndex, Userindex, 0, "M5")

                    End If

                Case Mineria

                    'If UserList(UserIndex).flags.PuedeTrabajar = 0 Then Exit Sub
                    If Not IntervaloPermiteTrabajar(Userindex) Then Exit Sub

                    If UserList(Userindex).Invent.HerramientaEqpObjIndex = 0 Then Exit Sub

                    If UserList(Userindex).Invent.HerramientaEqpObjIndex <> PIQUETE_MINERO Then
                        Call CloseUser(Userindex)
                        Exit Sub

                    End If

                    Call LookatTile(Userindex, UserList(Userindex).Pos.Map, X, Y)

                    auxind = MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex

                    If auxind > 0 Then
                        wpaux.Map = UserList(Userindex).Pos.Map
                        wpaux.X = X
                        wpaux.Y = Y

                        If Distancia(wpaux, UserList(Userindex).Pos) > 2 Then
                            Call SendData(ToIndex, Userindex, 0, "L2")
                            Exit Sub

                        End If

                        '¿Hay un yacimiento donde clickeo?
                        If ObjData(auxind).OBJType = OBJTYPE_YACIMIENTO Then

                            'pluto:6.2-------
                            If UserList(Userindex).flags.Macreanda = 0 Then
                                UserList(Userindex).flags.Macreanda = 2
                                'UserList(UserIndex).flags.Macreando = wpaux
                                Call SendData(ToIndex, Userindex, 0, "O2")

                            End If

                            '------------

                            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_MINERO)
                            Call DoMineria(Userindex)
                        Else
                            Call SendData(ToIndex, Userindex, 0, "M7")

                        End If

                    Else
                        Call SendData(ToIndex, Userindex, 0, "M7")

                    End If

                Case Domar
                    'Modificado 25/11/02
                    'Optimizado y solucionado el bug de la doma de
                    'criaturas hostiles.
                    Dim ci As Integer

                    Call LookatTile(Userindex, UserList(Userindex).Pos.Map, X, Y)
                    ci = UserList(Userindex).flags.TargetNpc

                    If ci > 0 Then

                        If Npclist(ci).flags.Domable > 0 Then
                            wpaux.Map = UserList(Userindex).Pos.Map
                            wpaux.X = X
                            wpaux.Y = Y

                            If Distancia(wpaux, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 2 Then
                                Call SendData(ToIndex, Userindex, 0, "L2")
                                Exit Sub

                            End If

                            If Npclist(ci).flags.AttackedBy <> "" Then
                                Call SendData(ToIndex, Userindex, 0, "||No podés domar una criatura que está luchando con un jugador." & "´" & FontTypeNames.FONTTYPE_INFO)
                                Exit Sub

                            End If

                            'pluto:6.2-------
                            If UserList(Userindex).flags.Macreanda = 0 Then
                                UserList(Userindex).flags.Macreanda = 3
                                'UserList(UserIndex).flags.Macreando = wpaux
                                Call SendData(ToIndex, Userindex, 0, "O2")

                            End If

                            '------------
                            Call DoDomar(Userindex, ci)
                        Else
                            Call SendData(ToIndex, Userindex, 0, "||No podes domar a esa criatura." & "´" & FontTypeNames.FONTTYPE_INFO)

                        End If

                    Else
                        Call SendData(ToIndex, Userindex, 0, "M6")

                    End If

                Case FundirMetal

                    If Not IntervaloPermiteTrabajar(Userindex) Then Exit Sub

                    'pluto:2.14---------------------------
                    auxind = MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex

                    If auxind > 0 Then
                        wpaux.Map = UserList(Userindex).Pos.Map
                        wpaux.X = X
                        wpaux.Y = Y

                        If Distancia(wpaux, UserList(Userindex).Pos) > 2 Then
                            Call SendData(ToIndex, Userindex, 0, "L2")
                            Exit Sub

                        End If

                    End If

                    '------------------------------
                    Call LookatTile(Userindex, UserList(Userindex).Pos.Map, X, Y)

                    If UserList(Userindex).flags.TargetObj > 0 Then

                        If ObjData(UserList(Userindex).flags.TargetObj).OBJType = OBJTYPE_FRAGUA Then

                            'pluto:6.2-------
                            If UserList(Userindex).flags.Macreanda = 0 Then
                                UserList(Userindex).flags.Macreanda = 4
                                UserList(Userindex).Counters.Macrear = 2000
                                'UserList(UserIndex).flags.Macreando = wpaux
                                Call SendData(ToIndex, Userindex, 0, "O2")

                            End If

                            '------------
                            Call FundirMineral(Userindex)
                        Else
                            Call SendData(ToIndex, Userindex, 0, "||Ahi no hay ninguna fragua." & "´" & FontTypeNames.FONTTYPE_INFO)

                        End If

                    Else
                        Call SendData(ToIndex, Userindex, 0, "||Ahi no hay ninguna fragua." & "´" & FontTypeNames.FONTTYPE_INFO)

                    End If

                Case Herreria

                    'pluto:2.14---------------------------
                    auxind = MapData(UserList(Userindex).Pos.Map, X, Y).OBJInfo.ObjIndex

                    If auxind > 0 Then
                        wpaux.Map = UserList(Userindex).Pos.Map
                        wpaux.X = X
                        wpaux.Y = Y

                        If Distancia(wpaux, UserList(Userindex).Pos) > 2 Then
                            Call SendData(ToIndex, Userindex, 0, "L2")
                            Exit Sub

                        End If

                    Else
                        Exit Sub

                    End If

                    '------------------------------

                    Call LookatTile(Userindex, UserList(Userindex).Pos.Map, X, Y)

                    If UserList(Userindex).flags.TargetObj > 0 Then

                        If ObjData(UserList(Userindex).flags.TargetObj).OBJType = OBJTYPE_YUNQUE Then
                            Call EnivarArmasConstruibles(Userindex)
                            Call EnivarArmadurasConstruibles(Userindex)
                            Call SendData2(ToIndex, Userindex, 0, 12)
                            'pluto:2.7.0
                            UserList(Userindex).flags.TargetObj = 0

                        Else
                            Call SendData(ToIndex, Userindex, 0, "||Ahi no hay ningun yunque." & "´" & FontTypeNames.FONTTYPE_INFO)

                        End If

                    Else
                        Call SendData(ToIndex, Userindex, 0, "||Ahi no hay ningun yunque." & "´" & FontTypeNames.FONTTYPE_INFO)

                    End If

            End Select

            UserList(Userindex).flags.PuedeTrabajar = 0
            Exit Sub

        Case "CIG"
            rdata = Right$(rdata, Len(rdata) - 3)
            X = Guilds.Count

            'pluto:2.4-->envia cero la reputacion----!
            If CreateGuild(UserList(Userindex).Name, 0, Userindex, rdata) Then
                'If CreateGuild(UserList(userindex).name, UserList(userindex).Reputacion.Promedio, userindex, rdata) Then

                If X = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||Felicidades has creado el primer clan de Argentum!!!." & "´" & FontTypeNames.FONTTYPE_INFO)
                Else
                    Call SendData(ToIndex, Userindex, 0, "||Felicidades has creado el clan numero " & X + 1 & " de Argentum!!!." & "´" & FontTypeNames.FONTTYPE_INFO)

                End If

                'pluto:6.0A
                NameClan(X) = UserList(Userindex).GuildInfo.GuildName
                Dim oGuild As cGuild
                Set oGuild = FetchGuild(UserList(Userindex).GuildInfo.GuildName)
                oGuild.Nivel = 1
            
                If UserList(Userindex).Faccion.ArmadaReal = 1 Then
                    oGuild.Faccion = 1

                End If
            
                If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
                    oGuild.Faccion = 2

                End If
            
                If UserList(Userindex).Faccion.ArmadaReal = 2 Then
                    oGuild.Faccion = 3

                End If
            
                Call SaveGuildsDB

            End If

            Exit Sub
        
        Case "BYV"
            rdata = Right$(rdata, Len(rdata) - 3)
            Dim aba  As Boolean
            Dim baba As Boolean
        
            aba = ReadField(1, rdata, 44)
            baba = ReadField(2, rdata, 44)

            If aba = False Or baba = False Then
                Call SendData(ToAdmins, 0, 0, "|| El usuario esta viendo INVISIBLE, tiene cliente editado... Procede con el BAN" & "´" & FontTypeNames.FONTTYPE_talk)
                Exit Sub

            End If

            If aba = True Or baba = True Then
                Call SendData(ToAdmins, 0, 0, "|| El usuario se esta comportando bien, dejalo entrenar tranquilo" & "´" & FontTypeNames.FONTTYPE_talk)
                Exit Sub

            End If

            'pluto:2.4
        Case "BYB"
            rdata = Right$(rdata, Len(rdata) - 3)
            Dim b As Integer
            tName = ReadField(1, rdata, 44)
            Tindex = NameIndex(tName & "$")
            b = val(ReadField(2, rdata, 44))

            If b > 4999 Then b = 4999
            'If UserList(tIndex).GuildInfo.FundoClan = 1 Then b = 5000

            Call WriteVar(CharPath & Left$(tName, 1) & "\" & tName & ".chr", "GUILD", "GuildPts", val(b))

            If Tindex <= 0 Then Exit Sub

            If UserList(Tindex).GuildInfo.FundoClan = 1 Then b = 5000
            UserList(Tindex).GuildInfo.GuildPoints = b
            Exit Sub

    End Select

    '----------------------------------------------------------------------
    '----------------------------------------------------------------------

    Select Case UCase$(Left$(rdata, 4))
    
        Case "NEWD"       ' >>> Sistema denuncias
            rdata = Right$(rdata, Len(rdata) - 4)
            Dim NombreDenunciado As String
            Dim Motivox          As String
            NombreDenunciado = ReadField(1, rdata, Asc(","))
            Motivox = ReadField(2, rdata, Asc(","))
        
            Tindex = NameIndex(NombreDenunciado)
            
            If FileExist(App.Path & "\Charfile\" & Left$(rdata, 1) & "\" & NombreDenunciado & ".chr") = False Then Exit Sub
     
            If Tindex <= 0 Then
                Call WriteVar(CharPath & NombreDenunciado & ".chr", "INIT", "PrimeraDenuncia", GetVar(CharPath & NombreDenunciado & ".chr", "INIT", "UltimaDenuncia"))
                Call WriteVar(CharPath & NombreDenunciado & ".chr", "INIT", "UltimaDenuncia", "" & Date & " - " & Time & "")
                Call SendData(ToAdmins, 0, 0, "NEWDENU" & UserList(Userindex).Name & "," & Motivox & "," & GetVar(CharPath & NombreDenunciado & ".chr", "INIT", "LastIP") & "," & GetVar(CharPath & NombreDenunciado & ".chr", "INIT", "LastIP") & "," & NombreDenunciado & "," & GetVar(CharPath & NombreDenunciado & ".chr", "INIT", "UltimoLogeo") & "," & GetVar(CharPath & NombreDenunciado & ".chr", "INIT", "UltimaDenuncia") & "," & GetVar(CharPath & NombreDenunciado & ".chr", "INIT", "PrimeraDenuncia"))
            Else
                UserList(Tindex).PrimeraDenuncia = UserList(Tindex).UltimaDenuncia
                UserList(Tindex).UltimaDenuncia = "" & Date & " - " & Time & ""
                Call SendData(ToAdmins, 0, 0, "NEWDENU" & UserList(Userindex).Name & "," & Motivox & "," & UserList(Tindex).ip & "," & UserList(Tindex).ip & "," & NombreDenunciado & "," & UserList(Tindex).UltimoLogeo & "," & UserList(Tindex).UltimaDenuncia & "," & UserList(Tindex).PrimeraDenuncia)

            End If

            Exit Sub
            
        Case "TUCU"
        
            rdata = Right$(rdata, Len(rdata) - 4)
            ObjSlot1 = ReadField(1, rdata, 44)
            ObjSlot2 = ReadField(2, rdata, 44)
            DragObjects (Userindex)
            Exit Sub
            
            'pluto:2.17
        Case "ATRI"
            Call EnviarAtrib(Userindex)
            Exit Sub

        Case "FAMA"
            Call EnviarFama(Userindex)
            Exit Sub

        Case "ESTA"
            Call SendESTADISTICAS(Userindex)
            Exit Sub

        Case "ESKI"
            Call EnviarSkills(Userindex)
            Exit Sub
            
            
            

            
            
        Case "INFS"    'Informacion del hechizo
            rdata = Right$(rdata, Len(rdata) - 4)

            If val(rdata) > 0 And val(rdata) < MAXUSERHECHIZOS + 1 Then
                Dim H As Integer
                H = UserList(Userindex).Stats.UserHechizos(val(rdata))

                If H > 0 And H < NumeroHechizos + 1 Then
                    Call SendData(ToIndex, Userindex, 0, "||%%%%%%%%%%%% INFO DEL HECHIZO %%%%%%%%%%%%" & "´" & FontTypeNames.FONTTYPE_INFO)
                    Call SendData(ToIndex, Userindex, 0, "||Nombre:" & Hechizos(H).Nombre & "´" & FontTypeNames.FONTTYPE_INFO)
                    Call SendData(ToIndex, Userindex, 0, "||Descripcion:" & Hechizos(H).Desc & "´" & FontTypeNames.FONTTYPE_INFO)
                    Call SendData(ToIndex, Userindex, 0, "||Skill requerido: " & Hechizos(H).MinSkill & " de magia." & "´" & FontTypeNames.FONTTYPE_INFO)
                    Call SendData(ToIndex, Userindex, 0, "||Mana necesario: " & Hechizos(H).ManaRequerido & "´" & FontTypeNames.FONTTYPE_INFO)
                    Call SendData(ToIndex, Userindex, 0, "||%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%" & "´" & FontTypeNames.FONTTYPE_INFO)

                End If

            Else
                Call SendData(ToIndex, Userindex, 0, "||¡Primero selecciona el hechizo.!" & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            Exit Sub

            'PLUTO:2.17
        Case "NMAS"
            rdata = Right$(rdata, Len(rdata) - 4)
            UserList(Userindex).Montura.Nombre(val(ReadField(2, rdata, 44))) = ReadField(1, rdata, 44)
            Exit Sub

        Case "EQUI"

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 4)

            If ReadField(2, rdata, 44) = "O" Then
                rdata = Left$(rdata, Len(rdata) - 1)
            Else
                Call LogCasino("Jugador:" & UserList(Userindex).Name & " entró con cliente modificado. (A)" & "Ip: " & UserList(Userindex).ip)
                Call SendData(ToAdmins, Userindex, 0, "|| Detectado Cliente Modificado en " & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_talk)

            End If

            If val(rdata) <= MAX_INVENTORY_SLOTS And val(rdata) > 0 Then

                If UserList(Userindex).Invent.Object(val(rdata)).ObjIndex = 0 Then Exit Sub
            Else
                Exit Sub

            End If

            Call EquiparInvItem(Userindex, val(rdata))
            Exit Sub

            'PLUTO:2.15
        Case "NBEB"
            rdata = Right$(rdata, Len(rdata) - 4)
            Call ComprobarNombreBebe(ReadField(1, rdata, 44), Userindex, ReadField(2, rdata, 44))
            'If ComprobarNombreBebe = True Then Nacimiento (UserIndex)
            Exit Sub
            '--------

        Case "SKSE"    'Modificar skills
            'Dim i As Integer
            Dim sumatoria  As Integer
            Dim incremento As Integer
            rdata = Right$(rdata, Len(rdata) - 4)

            'Codigo para prevenir el hackeo de los skills
            '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            For i = 1 To NUMSKILLS
                incremento = val(ReadField(i, rdata, 44))

                If incremento < 0 Then
                    'Call SendData(ToAll, 0, 0, "||Los Dioses han desterrado a " & UserList(UserIndex).Name & FONTTYPENAMES.FONTTYPE_INFO)
                    Call LogHackAttemp(UserList(Userindex).Name & " IP:" & UserList(Userindex).ip & " trato de hackear los skills.")
                    UserList(Userindex).Stats.SkillPts = 0
                    Call CloseUser(Userindex)
                    Exit Sub

                End If

                sumatoria = sumatoria + incremento
            Next i

            If sumatoria > UserList(Userindex).Stats.SkillPts Then
                'UserList(UserIndex).Flags.AdministrativeBan = 1
                'Call SendData(ToAll, 0, 0, "||Los Dioses han desterrado a " & UserList(UserIndex).Name & FONTTYPENAMES.FONTTYPE_INFO)
                Call LogHackAttemp(UserList(Userindex).Name & " IP:" & UserList(Userindex).ip & " trato de hackear los skills.")
                Call CloseUser(Userindex)
                Exit Sub

            End If

            '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

            For i = 1 To NUMSKILLS
                incremento = val(ReadField(i, rdata, 44))
                UserList(Userindex).Stats.SkillPts = UserList(Userindex).Stats.SkillPts - incremento
                UserList(Userindex).Stats.UserSkills(i) = UserList(Userindex).Stats.UserSkills(i) + incremento

                If UserList(Userindex).Stats.UserSkills(i) > MAXSKILLPOINTS Then UserList(Userindex).Stats.UserSkills(i) = MAXSKILLPOINTS
            Next i

            Call EnviarSkills(Userindex)
            Exit Sub

        Case "ENTR"    'Entrena hombre!

            If UserList(Userindex).flags.TargetNpc = 0 Then Exit Sub

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 3 Then Exit Sub

            rdata = Right$(rdata, Len(rdata) - 4)

            'If NPCHostiles(UserList(UserIndex).Pos.Map) < 6 Then
            If Npclist(UserList(Userindex).flags.TargetNpc).Mascotas < MAXMASCOTASENTRENADOR Then

                'pluto:6.0A
                If val(rdata) > 0 And val(rdata) < 6 Then
                    Dim SpawnedNpc As Integer
                    SpawnedNpc = SpawnNpc(Npclist(UserList(Userindex).flags.TargetNpc).Criaturas(val(rdata)).NpcIndex, Npclist(UserList(Userindex).flags.TargetNpc).Pos, True, False)

                    'pluto:6.3 cambio <= por <
                    If SpawnedNpc < MAXNPCS Then
                        Npclist(SpawnedNpc).MaestroNpc = UserList(Userindex).flags.TargetNpc
                        Npclist(UserList(Userindex).flags.TargetNpc).Mascotas = Npclist(UserList(Userindex).flags.TargetNpc).Mascotas + 1

                    End If

                End If

            Else
                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°No puedo traer mas criaturas, mata las existentes!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

            End If

            Exit Sub

        Case "COMP"

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            '¿El target es un NPC valido?
            If UserList(Userindex).flags.TargetNpc > 0 Then

                '¿El NPC puede comerciar?
                If Npclist(UserList(Userindex).flags.TargetNpc).Comercia = 0 Then
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°No tengo ningun interes en comerciar.°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                    Exit Sub

                End If

            Else
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 5)
            'User compra el item del slot rdata
            Call NPCVentaItem(Userindex, val(ReadField(1, rdata, 44)), val(ReadField(2, rdata, 44)), UserList(Userindex).flags.TargetNpc)
            Exit Sub

            '[KEVIN]*********************************************************************
            '------------------------------------------------------------------------------------
        Case "RETI"

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'pluto:6.5
            If UserList(Userindex).flags.TargetNpc = 0 Then Exit Sub

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = 30 Then
                rdata = Right(rdata, Len(rdata) - 5)
                'User retira el item del slot rdata
                Call UserRetiraItemClan(Userindex, val(ReadField(1, rdata, 44)), val(ReadField(2, rdata, 44)))
                Exit Sub

            End If

            '---------------------------------

            '¿El target es un NPC valido?
            If UserList(Userindex).flags.TargetNpc > 0 Then

                '¿Es el banquero?
                If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 4 And Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 25 Then
                    Exit Sub

                End If

            Else
                Exit Sub

            End If

            rdata = Right(rdata, Len(rdata) - 5)
            'User retira el item del slot rdata
            Call UserRetiraItem(Userindex, val(ReadField(1, rdata, 44)), val(ReadField(2, rdata, 44)))
            Exit Sub

            '-----------------------------------------------------------------------------------
            '[/KEVIN]****************************************************************************
        Case "VEND"

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            '¿El target es un NPC valido?
            If UserList(Userindex).flags.TargetNpc > 0 Then

                '¿El NPC puede comerciar?
                If Npclist(UserList(Userindex).flags.TargetNpc).Comercia = 0 Then
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°No tengo ningun interes en comerciar.°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                    Exit Sub

                End If

            Else
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 5)
            'User compra el item del slot rdata
            Call NPCCompraItem(Userindex, val(ReadField(1, rdata, 44)), val(ReadField(2, rdata, 44)))
            Exit Sub

            '[KEVIN]-------------------------------------------------------------------------
            '****************************************************************************************
        Case "DEPO"

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            '¿El target es un NPC valido?
            If UserList(Userindex).flags.TargetNpc > 0 Then

                'pluto:6.0A
                If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = 30 Then
                    rdata = Right(rdata, Len(rdata) - 5)
                    'User retira el item del slot rdata
                    Call UserDepositaItemClan(Userindex, val(ReadField(1, rdata, 44)), val(ReadField(2, rdata, 44)))
                    Exit Sub

                End If

                '---------------------------------

                '¿El NPC puede comerciar?
                If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 4 Then
                    Call SendData(ToIndex, Userindex, 0, "||¡No puedes soltar objetos en este NPC!" & "´" & FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

            Else
                Exit Sub

            End If

            rdata = Right(rdata, Len(rdata) - 5)
            'User deposita el item del slot rdata
            Call UserDepositaItem(Userindex, val(ReadField(1, rdata, 44)), val(ReadField(2, rdata, 44)))
            Exit Sub

            '****************************************************************************************
            '[/KEVIN]---------------------------------------------------------------------------------
    End Select

    '-------------------------------------------------------------------------------
    '-------------------------------------------------------------------------------

    Select Case UCase$(Left$(rdata, 5))

        Case "DEMSG"

            If UserList(Userindex).flags.TargetObj > 0 Then
                rdata = Right$(rdata, Len(rdata) - 5)
                Dim f As String, Titu As String, msg As String, f2 As String
                f = App.Path & "\foros\"
                f = f & UCase$(ObjData(UserList(Userindex).flags.TargetObj).ForoID) & ".for"
                '[MerLiNz:5]
                Titu = "<" & UserList(Userindex).Name & "> "
                Titu = Titu & ReadField(1, rdata, 176)
                '[\END]
                msg = ReadField(2, rdata, 176)
                Dim n2 As Integer, loopme As Integer

                If FileExist(f, vbNormal) Then
                    Dim num As Integer
                    num = val(GetVar(f, "INFO", "CantMSG"))

                    If num > MAX_MENSAJES_FORO Then

                        For loopme = 1 To num
                            Kill App.Path & "\foros\" & UCase$(ObjData(UserList(Userindex).flags.TargetObj).ForoID) & loopme & ".for"
                        Next
                        Kill App.Path & "\foros\" & UCase$(ObjData(UserList(Userindex).flags.TargetObj).ForoID) & ".for"
                        num = 0

                    End If

                    n2 = FreeFile
                    f2 = Left$(f, Len(f) - 4)
                    f2 = f2 & num + 1 & ".for"
                    Open f2 For Output As n2
                    Print #n2, Titu
                    Print #n2, msg
                    Call WriteVar(f, "INFO", "CantMSG", num + 1)
                Else
                    n2 = FreeFile
                    f2 = Left$(f, Len(f) - 4)
                    f2 = f2 & "1" & ".for"
                    Open f2 For Output As n2
                    Print #n2, Titu
                    Print #n2, msg
                    Call WriteVar(f, "INFO", "CantMSG", 1)

                End If

                Close #n2

            End If

            Exit Sub

    End Select

    '----------------------------------------------------------------------------
    '----------------------------------------------------------------------------

    Select Case UCase$(Left$(rdata, 6))
    
        Case "CONSUL" 'Enviamos todos los s.o.s de los usuarios al cliente.
            rdata = Right$(rdata, Len(rdata) - 6)
        
            Dim dataSOS As String
            dataSOS = MensajesNumber & ","
        
            For loopc = 1 To MensajesNumber
                dataSOS = dataSOS & MensajesSOS(loopc).Tipo & "-" & MensajesSOS(loopc).Autor & "-" & MensajesSOS(loopc).Contenido & ","
            Next loopc
        
            Call SendData(ToIndex, Userindex, 0, "ZSOS" & dataSOS)
        
            Exit Sub

        Case "DESCOD"    'Informacion del hechizo
            rdata = Right$(rdata, Len(rdata) - 6)
            Call UpdateCodexAndDesc(rdata, Userindex)
            Exit Sub

    End Select

    '[Alejo]
    Select Case UCase$(Left$(rdata, 7))

        Case "OFRECER"
            rdata = Right$(rdata, Len(rdata) - 7)
            Arg1 = ReadField(1, rdata, Asc(","))
            Arg2 = ReadField(2, rdata, Asc(","))

            If val(Arg1) <= 0 Or val(Arg2) <= 0 Or UserList(Userindex).ComUsu.DestUsu <= 0 Then
                Exit Sub

            End If

            'pluto:6.3---------------
            If UserList(UserList(Userindex).ComUsu.DestUsu).flags.Montura > 0 Or UserList(Userindex).flags.Montura > 0 Then
                Call FinComerciarUsu(Userindex)
                Exit Sub

            End If

            '---------------------

            'pluto:2.9.0 esta comerciando
            If UserList(UserList(Userindex).ComUsu.DestUsu).flags.Comerciando = True And UserList(UserList(Userindex).ComUsu.DestUsu).ComUsu.DestUsu <> Userindex Then
                Call SendData(ToIndex, Userindex, 0, "||Ya está comerciando con otro user." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                Call FinComerciarUsu(Userindex)
                Exit Sub

            End If

            If UserList(UserList(Userindex).ComUsu.DestUsu).flags.UserLogged = False Then
                'sigue vivo el usuario ?
                Call FinComerciarUsu(Userindex)
                Exit Sub
            Else

                'esta vivo ?
                If UserList(UserList(Userindex).ComUsu.DestUsu).flags.Muerto = 1 Then
                    Call FinComerciarUsu(Userindex)
                    Exit Sub

                End If

                '//Tiene la cantidad que ofrece ??//'
                If val(Arg1) = FLAGORO Then

                    'oro
                    If val(Arg2) > UserList(Userindex).Stats.GLD Then
                        Call SendData(ToIndex, Userindex, 0, "||No tienes esa cantidad." & "´" & FontTypeNames.FONTTYPE_talk)
                        Exit Sub

                    End If

                Else

                    'inventario
                    If val(Arg2) > UserList(Userindex).Invent.Object(val(Arg1)).Amount Then
                        Call SendData(ToIndex, Userindex, 0, "||No tienes esa cantidad." & "´" & FontTypeNames.FONTTYPE_talk)
                        Exit Sub

                    End If

                End If

                UserList(Userindex).ComUsu.Objeto = val(Arg1)
                UserList(Userindex).ComUsu.Cant = val(Arg2)

                If UserList(UserList(Userindex).ComUsu.DestUsu).ComUsu.DestUsu <> Userindex Then
                    'Es el primero que ofrece algo ?
                    Call SendData(ToIndex, UserList(Userindex).ComUsu.DestUsu, 0, "||" & UserList(Userindex).Name & " desea comerciar. Si deseas aceptar, Escribe /COMERCIAR." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                    UserList(UserList(Userindex).ComUsu.DestUsu).flags.TargetUser = Userindex
                Else

                    '[CORREGIDO]
                    If UserList(UserList(Userindex).ComUsu.DestUsu).ComUsu.Acepto = True Then
                        'NO NO NO vos te estas pasando de listo...
                        UserList(UserList(Userindex).ComUsu.DestUsu).ComUsu.Acepto = False
                        Call SendData(ToIndex, UserList(Userindex).ComUsu.DestUsu, 0, "||" & UserList(Userindex).Name & " HA CAMBIADO SU OFERTA!!." & "´" & FontTypeNames.FONTTYPE_talk)

                        'Call SendData(ToIndex, UserList(userindex).ComUsu.DestUsu, 0, "!!" & " CUIDADO!! El otro jugador ha cambiado su oferta, comprueba bién lo que te está ofreciendo antes de aceptarla." & ENDC)
                        'Call SendData2(ToIndex, UserList(UserIndex).ComUsu.DestUsu, 0, 43, "CUIDADO HA CAMBIADO SU OFERTA")
                    End If

                    '[/CORREGIDO]
                    'Es la ofrenda de respuesta :)
                    Call EnviarObjetoTransaccion(UserList(Userindex).ComUsu.DestUsu)

                End If

            End If

            Exit Sub

    End Select

    '[/Alejo]

    '----------------------------------------------------------------------------
    '----------------------------------------------------------------------------

    Select Case UCase$(Left$(rdata, 8))

        Case "ACEPPEAT"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call AcceptPeaceOffer(Userindex, rdata)
            Exit Sub

        Case "PEACEOFF"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call RecievePeaceOffer(Userindex, rdata)
            Exit Sub

        Case "PEACEDET"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call SendPeaceRequest(Userindex, rdata)
            Exit Sub

        Case "ENVCOMEN"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call SendPeticion(Userindex, rdata)
            Exit Sub

        Case "ENVPROPP"
            Call SendPeacePropositions(Userindex)
            Exit Sub

        Case "DECGUERR"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call DeclareWar(Userindex, rdata)
            Exit Sub

        Case "DECALIAD"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call DeclareAllie(Userindex, rdata)
            Exit Sub

        Case "NEWWEBSI"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call SetNewURL(Userindex, rdata)
            Exit Sub

        Case "ACEPTARI"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call AcceptClanMember(Userindex, rdata)
            Exit Sub

        Case "RECHAZAR"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call DenyRequest(Userindex, rdata)
            Exit Sub

        Case "ECHARCLA"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call EacharMember(Userindex, rdata)
            Exit Sub

        Case "ACTGNEWS"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call UpdateGuildNews(rdata, Userindex)
            Exit Sub

        Case "1HRINFO<"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call SendCharInfo(rdata, Userindex)
            Exit Sub

        Case "NEWWLOGO"
            rdata = Right$(rdata, Len(rdata) - 8)
            Call SetNewEmblema(Userindex, rdata)
            Exit Sub

    End Select

    '----------------------------------------------------------------------------
    '----------------------------------------------------------------------------

    Select Case UCase$(Left$(rdata, 9))

        Case "SOLICITUD"
            rdata = Right$(rdata, Len(rdata) - 9)
            'pluto:2.20--------
            Dim ah As Integer
            'UserList(UserIndex).GuildInfo.ClanesParticipo = 11
            ah = (10 - UserList(Userindex).GuildInfo.ClanesParticipo)

            If ah < 1 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes entrar en más clanes. Realizando las DraG Quest en el NpcQuest puedes ganar una solicitud adicional por cada 20 Quest." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            '------------------
            Call SolicitudIngresoClan(Userindex, rdata)
            Exit Sub

    End Select

    '----------------------------------------------------------------------------
    '----------------------------------------------------------------------------

    Select Case UCase$(Left$(rdata, 11))

        Case "CLANDETAILS"
            rdata = Right$(rdata, Len(rdata) - 11)
            Call SendGuildDetails(Userindex, rdata)
            Exit Sub

    End Select

    '----------------------------------------------------------------------------
    '----------------------------------------------------------------------------

    'pluto:2.8.0
    If UCase$(Left$(rdata, 4)) = "BOLL" Then
        rdata = Right$(rdata, Len(rdata) - 4)
        Dim nIndex As Integer
        'nindex = ReadField(2, rdata, 44)
        Dim cochi  As Integer
        cochi = RandomNumber(1, 100)

        If cochi > 50 Then Call MoveNPCChar(Balon, ReadField(1, rdata, 44))
        Exit Sub

    End If

    'PLUTO:6.0a
    If Left$(rdata, 3) = "LIX" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Dim Tipi   As Byte
        Dim Seleci As Byte
        Tipi = ReadField(1, rdata, 44)
        Tipi = Tipi + 1
        Tindex = ReadField(2, rdata, 44)
        Seleci = ReadField(3, rdata, 44)

        If UserList(Tindex).Montura.Libres(Seleci) <= 0 Then Exit Sub

        UserList(Tindex).Montura.Libres(Seleci) = UserList(Tindex).Montura.Libres(Seleci) - 1

        Select Case Tipi

            Case 1
                UserList(Tindex).Montura.AtCuerpo(Seleci) = UserList(Tindex).Montura.AtCuerpo(Seleci) + 1

            Case 2
                UserList(Tindex).Montura.Defcuerpo(Seleci) = UserList(Tindex).Montura.Defcuerpo(Seleci) + 1

            Case 3
                UserList(Tindex).Montura.AtFlechas(Seleci) = UserList(Tindex).Montura.AtFlechas(Seleci) + 1

            Case 4
                UserList(Tindex).Montura.DefFlechas(Seleci) = UserList(Tindex).Montura.DefFlechas(Seleci) + 1

            Case 5
                UserList(Tindex).Montura.AtMagico(Seleci) = UserList(Tindex).Montura.AtMagico(Seleci) + 1

            Case 6
                UserList(Tindex).Montura.DefMagico(Seleci) = UserList(Tindex).Montura.DefMagico(Seleci) + 1

            Case 7
                UserList(Tindex).Montura.Evasion(Seleci) = UserList(Tindex).Montura.Evasion(Seleci) + 1

        End Select

        Exit Sub

    End If

    'pluto:2.4.7
    If Left$(rdata, 3) = "BO5" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Tindex = ReadField(1, rdata, 44)

        'pluto:6.7
        If UserList(Tindex).flags.Privilegios = 0 Then Exit Sub
        'pluto:2.15
        Call LogCasino("Jugador:" & UserList(Tindex).Name & " hizo foto " & "Ip: " & UserList(Tindex).ip)
        Call SendData(ToGM, Tindex, 0, "|| Foto desde la ip: " & UserList(Tindex).ip & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData2(ToIndex, Tindex, 0, 84, rdata)
        Exit Sub

    End If

    '-----------------
    'pluto:2.5.0
    If Left$(rdata, 3) = "BO6" Then
        'quitar esto
        Exit Sub
        rdata = Right$(rdata, Len(rdata) - 3)
        Call LogInitModificados(rdata)
        Exit Sub

    End If

    'pluto:2.8.0
    If Left$(rdata, 3) = "BO8" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Tindex = ReadField(1, rdata, 44)

        'pluto:6.7
        If UserList(Tindex).flags.Privilegios = 0 Then Exit Sub
        Call SendData2(ToIndex, Tindex, 0, 86, rdata)
        Exit Sub

    End If

    'pluto:2.8.0
    If Left$(rdata, 3) = "BO9" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Tindex = ReadField(1, rdata, 44)

        'pluto:6.7
        If UserList(Tindex).flags.Privilegios = 0 Then Exit Sub
        Call SendData2(ToIndex, Tindex, 0, 88, rdata)
        Exit Sub

    End If

    'pluto:6.2
    If Left$(rdata, 3) = "XO1" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Call SendData(ToGM, 0, 0, "|| Conexión Correcta." & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToGM, 0, 0, "|| Realizando Foto." & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "S8")
        Exit Sub

    End If

    'pluto:6.2
    If Left$(rdata, 3) = "XO2" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Call SendData(ToGM, 0, 0, "|| Conexión Incorrecta!!." & "´" & FontTypeNames.FONTTYPE_INFO)
        'Call SendData(ToIndex, UserIndex, 0, "S8")
        Exit Sub

    End If

    'pluto:2.13
    If Left$(rdata, 3) = "TA1" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Tindex = ReadField(1, rdata, 44)

        'pluto:6.7
        If UserList(Tindex).flags.Privilegios = 0 Then Exit Sub

        Call SendData(ToIndex, Tindex, 0, "Z1" & rdata)
        Exit Sub

    End If

    'pluto:2.9.0 'Se crea un Torneo
    If Left$(rdata, 3) = "TO2" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Call CrearTorneo(rdata)
        Call EnviarTorneo(Userindex)
        Exit Sub

    End If

    'pluto:2.9.0 'Se participa Torneo
    If Left$(rdata, 3) = "TO3" Then
        'rdata = Right$(rdata, Len(rdata) - 3)
        Call ParticipaTorneo(UserList(Userindex).Name)
        Exit Sub

    End If

    Exit Sub
ErrorComandoPj:
    Call LogError("TCP1. CadOri:" & CadenaOriginal & " Nom:" & UserList(Userindex).Name & "UI:" & Userindex & " N: " & Err.number & " D: " & Err.Description)
    Call CloseSocket(Userindex)

End Sub
