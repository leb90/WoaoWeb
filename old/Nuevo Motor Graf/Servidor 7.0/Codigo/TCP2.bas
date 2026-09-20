Attribute VB_Name = "tcp2"

Private Sub IniDeleteSection(ByVal sIniFile As String, ByVal sSection As String)
    Call writeprivateprofilestring(sSection, 0&, 0&, sIniFile)

End Sub

Sub TCP2(ByVal Userindex As Integer, ByVal rdata As String)

    On Error GoTo ErrorComandoPj:

    Dim LC             As Byte
    Dim tot            As Integer
    Dim sndData        As String
    Dim CadenaOriginal As String
    Dim Moverse        As Byte
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
    Dim ind
    Dim n      As Integer
    Dim wpaux  As WorldPos
    Dim mifile As Integer
    Dim X      As Integer
    Dim Y      As Integer
    Dim HayGM  As Boolean
    Dim GM1    As String
    'pluto:6.0A
    CadenaOriginal = rdata

    If rdata = "" Then Exit Sub

    'pluto:2.10
    '¿Tiene un indece valido?
    If Userindex <= 0 Then
        Call CloseSocket(Userindex)
        Call LogError(Date & " Userindex no válido")
        Exit Sub

    End If

    '¿Está logeado?
    If UserList(Userindex).flags.UserLogged = False Then
        Call CloseSocket(Userindex, True)
        Exit Sub

    End If

    If UCase(Left(rdata, 9)) = "/SMSUSER " Then
        Dim smsSuma  As String
        Dim smsResta As String
        Dim asunto   As String
        Dim mensaje  As String
        'Call SendData(ToIndex, UserIndex, 0, "|| HOLAHOLA " & rdata & "´" & FontTypeNames.FONTTYPE_info)
        rdata = Right$(rdata, Len(rdata) - 9)
        nick = ReadField(1, rdata, 35)
        asunto = ReadField(2, rdata, 35)
        mensaje = ReadField(3, rdata, 35)

        If Not PersonajeExiste(nick) Then
            Call SendData(ToIndex, Userindex, 0, "||El personaje no existe." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If Not FileExist(App.Path & "\MAIL\" & Left$(UCase$(nick), 1), vbDirectory) Then
            'cambiamos el esto: antes era: Call MkDir(App.Path & "\MAIL\" & Left$(UCase$(nick), 1))
            MkDir (App.Path & "\MAIL\" & Left$(UCase$(nick), 1))
            Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "SMS", "0")
            Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "BAN", "0")
            Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "AVISO", "0")
            Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "FECHA", "1")

        End If

        'If Not FileExist("\MAIL\" & nick & Left$(nick, 1) & "\" & ".MAIL", vbArchive) Then
        'Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "SMS", 0)
        'End If
        smsResta = GetVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "SMS")
        smsSuma = val(smsResta) + 1

        If smsResta = 25 Then
            Call SendData(ToIndex, Userindex, 0, "||El personaje tiene la bandeja llena, no puedes enviarle mensajes." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'Call WriteVar(App.Path & "\logs\" & "BanDetail.dat", este, "Reason", Name)
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "SMS", smsSuma)
        'Call WriteVar(App.Path & "\logs\" & "BanDetail.dat", este, "Reason", Name)
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "DE", UserList(Userindex).Name)
        'Call WriteVar(App.Path & "\Ubicación en la carpeta\" & "Nombre de archivo" & ".tipo de archivo", "Contenido", "Contenido1", Text1.Text)
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "ASUNTO", asunto)
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "FECHA", Format(Now, "dd/mm/yy"))
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "MENSAJE", mensaje)
        bansms = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "BAN")

        If bansms = 1 Then
            Exit Sub

        End If

        Call SendData(ToIndex, Userindex, 0, "||Mensaje Enviado" & "´" & FontTypeNames.FONTTYPE_INFO)
        smsmensaje = GetVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "mensaje")
        'Call SendData(ToIndex, UserIndex, 0, "||Mensaje: " & smsmensaje & "´" & FontTypeNames.FONTTYPE_info)
        Tindex = NameIndex(nick)

        If Tindex = 0 Then
        Else
            Call SendData2(ToIndex, Tindex, 0, 114)

        End If

    End If

    '@Nati: wwww.juegosdrag.es - 2011
    If UCase$(rdata) = "/SMSREFRESH" Then
        Dim mensajes   As String
        Dim fecha      As String
        Dim Nombre     As String
        Dim asuntosms  As String
        Dim mensajesx  As String
        Dim fechax     As String
        Dim nombrex    As String
        Dim asuntosmsx As String
        Dim smsTOTAL   As String

        If Not FileExist(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1), vbDirectory) Then
            Call MkDir(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1))

        End If

        If Not FileExist(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", vbArchive) Then
            Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "SMS", "0")
            Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "BAN", "0")
            Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "AVISO", "0")
            Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "FECHA", "1")

        End If

        'If Not FileExist("\MAIL\" & nick & Left$(UserList(UserIndex).Name, 1) & "\" & ".MAIL", vbArchive) Then
        'Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(UserIndex).Name, 1) & "\" & UserList(UserIndex).Name & ".MAIL", "INFO", "SMS", 0)
        'End If
        smsTOTAL = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "SMS")

        For natillas = 1 To smsTOTAL
            Nombre = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & natillas, "DE")
            asuntosms = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & natillas, "ASUNTO")
            mensajes = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & natillas, "MENSAJE")
            fecha = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & natillas, "FECHA")
            Call SendData2(ToIndex, Userindex, 0, 112, Nombre & "#" & asuntosms & "#" & mensajes & "#" & fecha & "#" & natillas)
        Next

    End If

    '@Nati: wwww.juegosdrag.es - 2011
    If UCase$(Left(rdata, 8)) = "/SMSPAM " Then
        'Exit Sub
        Dim avisojj As String
        rdata = Right$(rdata, Len(rdata) - 8)
        nick = ReadField(1, rdata, 35)
        asunto = ReadField(2, rdata, 35)
        mensaje = ReadField(3, rdata, 35)
        avisojj = GetVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "AVISO")
        avisojj = avisojj + 1
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "AVISO", avisojj)
        Dim SMSPAM As Integer
        SMSPAM = FreeFile    ' obtenemos un canal
        Open App.Path & "\logs\mensajesSPAM.log" For Append As #SMSPAM
        Print #SMSPAM, "-----------------------------------"
        Print #SMSPAM, "Usuario denunciado: " & nick
        Print #SMSPAM, "Asunto: " & asunto
        Print #SMSPAM, "Asunto: " & mensaje
        Print #SMSPAM, "Por: " & UserList(Userindex).Name
        Print #SMSPAM, "-----------------------------------"
        Close #SMSPAM
        smsResta = GetVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "SMS")
        smsSuma = val(smsResta) + 1
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "SMS", smsSuma)
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "SMS", smsSuma)
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "DE", "AODragbot")
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "ASUNTO", "Denuncia")
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "FECHA", Format(Now, "dd/mm/yy"))
        Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "MENSAJE" & smsSuma, "MENSAJE", "Has sido denunciado por el usuario: " & UserList(Userindex).Name & " Tienes: " & avisojj & " de denuncias.")

        If avisojj > 15 Then
            Dim fechatrucha As String
            fechoy = Format(Now, "dd/mm/yy")
            fechatrucha = 7 + (Left(fechoy, 2))
            Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "BAN", "1")
            Call WriteVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "FECHA", fechatrucha)

        End If

        fechaban = GetVar(App.Path & "\MAIL\" & Left$(nick, 1) & "\" & nick & ".MAIL", "INFO", "FECHA")

        If fechaban = 0 Then
        Else

        End If

    End If

    '@Nati: wwww.juegosdrag.es - 2011
    If UCase(rdata) = "/DESPAM" Then
        fechaban = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "FECHA")

        If fechaban = 1 Then
            Exit Sub
        Else
            fechoy = Format(Now, "dd/mm/yy")
            fecharesta = (Left(fechaban, 2)) - (Left(fechoy, 2))

            If fecharesta = "0" Or fechaban > fechoy Then
                Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "FECHA", "0")
                Call SendData(ToIndex, Userindex, 0, "||Has sido desbaneado, ya puedes usar el sistema de mensajeria." & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

        End If

    End If

    '@Nati: wwww.juegosdrag.es - 2011
    '@Nati: Comando muy costoso :(
    If UCase(Left(rdata, 9)) = "/SMSKILL " Then
        rdata = Right$(rdata, Len(rdata) - 9)
        Dim smsALL As String
        Dim smsREM As String
        'SMS TOTALES AHORA
        smsALL = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "SMS")
        'SMS TOTALES DESPUES
        smsREM = val(smsALL) - 1
        'SMS OK
        'smsOK = WriteVar(App.Path & "\MAIL\" & Left$(UserList(UserIndex).Name, 1) & "\" & UserList(UserIndex).Name & ".MAIL", "INFO", "SMS", smsREM)
        Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "INFO", "SMS", smsREM)

        If smsALL = rdata Then
            sFicINI = App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL"
            File = App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL"
            sSeccion = "MENSAJE" & rdata
            IniDeleteSection sFicINI, sSeccion
            Exit Sub

        End If

        'ESTRUCTURA DEL MENSAJE FUERA
        sFicINI = App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL"
        File = App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL"
        sSeccion = "MENSAJE" & rdata
        IniDeleteSection sFicINI, sSeccion
        Call SendData(ToIndex, Userindex, 0, "||El mensaje ha sido borrado con exito." & "´" & FontTypeNames.FONTTYPE_INFO)

        'AQUI ORGANIZAMOS LOS MENSAJES.
        If smsALL < 1 Then Exit Sub

        For n = 1 To smsALL
            nombrex = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "DE")
            asuntosmsx = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "ASUNTO")
            mensajesx = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "MENSAJE")
            fechax = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "FECHA")
            sFicINI = App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL"
            File = App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL"
            sSeccion = "MENSAJE" & n
            IniDeleteSection sFicINI, sSeccion
            DoEvents

            If n = rdata Then
                borranormal = False
                borramensajenulo = True

                If n = 1 Then
                    n = n + 1
                    cambion = True

                End If

            End If

            If n - 1 = 0 Then
                Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "DE", nombrex)
                Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "ASUNTO", asuntosmsx)
                Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "FECHA", fechax)
                Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "MENSAJE", mensajesx)
                borranormal = True
            Else

                If borranormal = True Then
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "DE", nombrex)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "ASUNTO", asuntosmsx)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "FECHA", fechax)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "MENSAJE", mensajesx)

                End If

                If borra2 = True Then
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n - 1, "DE", nombrex)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n - 1, "ASUNTO", asuntosmsx)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n - 1, "FECHA", fechax)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n - 1, "MENSAJE", mensajesx)

                    'borranormal2 = True
                End If

                If borramensajenulo = True Then

                    If cambion = True Then
                        n = n - 1
                        cambion = False

                    End If

                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "DE", nombrex)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "ASUNTO", asuntosmsx)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "FECHA", fechax)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n, "MENSAJE", mensajesx)
                    sFicINI = App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL"
                    File = App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL"
                    sSeccion = "MENSAJE" & n
                    IniDeleteSection sFicINI, sSeccion
                    borra2 = True
                    borramensajenulo = False

                End If

                If borranormal2 = True Then
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n - 1, "DE", nombrex)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n - 1, "ASUNTO", asuntosmsx)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n - 1, "FECHA", fechax)
                    Call WriteVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & n - 1, "MENSAJE", mensajesx)
                    borra2 = False

                End If

            End If

        Next n

        DoEvents

    End If

    '@Nati: wwww.juegosdrag.es - 2011
    If UCase(Left(rdata, 9)) = "/SMSREAD " Then
        rdata = Right$(rdata, Len(rdata) - 9)
        numero = rdata
        Nombre = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & numero, "DE")
        asuntosms = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & numero, "ASUNTO")
        fecha = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & numero, "FECHA")
        mensaje = GetVar(App.Path & "\MAIL\" & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".MAIL", "MENSAJE" & numero, "MENSAJE")
        Call SendData2(ToIndex, Userindex, 0, 113, Nombre & "#" & asuntosms & "#" & mensaje)

    End If

    If UCase$(Left$(rdata, 5)) = "/BUG " Then
        n = FreeFile
        Open App.Path & "\BUGS\BUGs.log" For Append Shared As n
        Print #n, "--------------------------------------------"
        Print #n, "Usuario:" & UserList(Userindex).Name & "  Fecha:" & Date & "    Hora:" & Time
        Print #n, "BUG:"
        Print #n, Right$(rdata, Len(rdata) - 5)
        Close #n
        Call SendData(ToIndex, Userindex, 0, "|| Entregado mensaje de BUG: " & Right$(rdata, Len(rdata) - 5) & " .Muchas Gracias por tu Colaboración." & "´" & FontTypeNames.FONTTYPE_INFO)
        'pluto:2.17
        Tindex = NameIndex("AoDraGBoT")

        If Tindex <= 0 Then Exit Sub
        Call SendData(ToIndex, Tindex, 0, "|| BUG: " & UserList(Userindex).Name & " " & Right$(rdata, Len(rdata) - 5) & "´" & FontTypeNames.FONTTYPE_talk)
        Exit Sub

    End If

    'pluto.6.2
    If UCase$(Left$(rdata, 7)) = "/MACRO " Then
        rdata = Right$(rdata, Len(rdata) - 7)

        If UserList(Userindex).flags.ComproMacro = 0 Then Exit Sub

        If CodigoMacro = val(rdata) Then
            Call SendData(ToIndex, Userindex, 0, "||Código Correcto. Muchas Gracias!!" & "´" & FontTypeNames.FONTTYPE_talk)
            UserList(Userindex).flags.ComproMacro = 0
            'COMPROBANDOMACRO = False
        Else
            Call SendData(ToIndex, Userindex, 0, "||Código Incorrecto !!" & "´" & FontTypeNames.FONTTYPE_talk)

        End If

        Exit Sub

    End If

    'Sistema Subastas
    If UCase$(Left(rdata, 9)) = "/OFERTAR " Then
        Dim oferta As Long
        rdata = Right$(rdata, Len(rdata) - 9)
        oferta = val(rdata)

        If oferta > 2000000000 Then Exit Sub
        Ofertar Userindex, oferta
        Exit Sub

    End If

    If UCase$(Left(rdata, 9)) = "/SUBASTAR" Then
        Dim Precioinicial As Long

        If Len(rdata) = 9 Then
            Precioinicial = 1
        Else
            rdata = Right$(rdata, Len(rdata) - 10)

        End If

        Precioinicial = val(rdata)

        If Precioinicial <= 0 Then Precioinicial = 1

        If Subastas.HaySubastas = True Then
            Call SendData(ToIndex, Userindex, 0, "||Ya hay una subasta, espera a q termine." & FONTTYPE_INFO)
            Exit Sub

        End If

        Call Subastar(Userindex, Precioinicial)
        Exit Sub

    End If

    'Blood Castle
    If UCase$(Left$(rdata, 12)) = "/BLOODCASTLE" Then

        If UserList(Userindex).flags.Invisible = 1 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "No puedes ingresar al Evento invisible.")
            Exit Sub

        End If

        If UserList(Userindex).flags.Montura = 1 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "No puedes ingresar al Evento montado.")
            Exit Sub

        End If

        If UserList(Userindex).Pos.Map = 66 Then    'Si el user esta en ulla, no lo deja regresar, podria laguear el sv con eso
            Call SendData(ToIndex, Userindex, 0, "|/Blood Castle" & "> " & "Estas en la carcel, no seas pillo.")    'Juance!
            Exit Sub

        End If

        If UserList(Userindex).Pos.Map = 205 Then    'Si el user esta en ulla, no lo deja regresar, podria laguear el sv con eso
            Call SendData(ToIndex, Userindex, 0, "|/Blood Castle" & "> " & "Ya estas Participando.")    'Juance!
            Exit Sub

        End If

        If UserList(Userindex).flags.BloodGames = True Then    'Si el user esta en ulla, no lo deja regresar, podria laguear el sv con eso
            Call SendData(ToIndex, Userindex, 0, "|/Blood Castle" & "> " & "Ya estas Participando.")    'Juance!
            Exit Sub

        End If

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "|/Blood Castle" & "> " & "No puedes ingresar estando muerto.")
            Exit Sub

        End If

        Call BloodGames_Entra(Userindex)
        Exit Sub

    End If

    'Blood Castle
    'Juegos del Hambre automatico
    If UCase$(Left$(rdata, 7)) = "/HUNGER" Then
    
        If UserList(Userindex).Invent.NroItems = 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Debes vaciar tu inventario para ingresar.")
            Exit Sub

        End If

        If UserList(Userindex).flags.Invisible = 1 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Debes estar visible para ingresar a los juegos del hambre.")
            Exit Sub

        End If

        'desequipar armadura
        If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        'desequipar arma
        If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        'desequipar casco
        If UserList(Userindex).Invent.CascoEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        'desequipar casco
        If UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        If UserList(Userindex).Invent.AlaEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        '[GAU]
        'desequipar botas
        If UserList(Userindex).Invent.BotaEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        '[GAU]
        'Pluto:2.4
        If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        '----fin Pluto:2.4---------
        'desequipar herramienta
        If UserList(Userindex).Invent.HerramientaEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        'desequipar municiones
        If UserList(Userindex).Invent.MunicionEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Deposita todos tus items que se caigan, o los perderas al entrar al evento. Es obligación entrar desnudo, te proveeremos de equipamiento.")
            Exit Sub

        End If

        If UserList(Userindex).flags.Montura = 1 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "No puedes ingresar al Evento montado.")
            Exit Sub

        End If

        If UserList(Userindex).Pos.Map = 66 Then    'Si el user esta en ulla, no lo deja regresar, podria laguear el sv con eso
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Estas en la carcel, no seas pillo.")    'Juance!
            Exit Sub

        End If

        If UserList(Userindex).Pos.Map = 268 Then    'Si el user esta en ulla, no lo deja regresar, podria laguear el sv con eso
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Ya estas Participando.")    'Juance!
            Exit Sub

        End If

        If UserList(Userindex).flags.HungerGames = True Then    'Si el user esta en ulla, no lo deja regresar, podria laguear el sv con eso
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Ya estas Participando.")    'Juance!
            Exit Sub

        End If

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "No puedes ingresar estando muerto.")
            Exit Sub

        End If

        Call HungerGames_Entra(Userindex)
        Exit Sub

    End If

    'Juegos del Hambre automatico
    If UCase$(Left$(rdata, 6)) = "/DESC " Then
        rdata = Right$(rdata, Len(rdata) - 6)

        If Not AsciiDescripcion(rdata) Then
            Call SendData(ToIndex, Userindex, 0, "||La descripcion tiene caracteres invalidos." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        UserList(Userindex).Desc = Trim$(rdata)
        Call SendData(ToIndex, Userindex, 0, "||La descripción ha cambiado." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If UCase$(Left$(rdata, 6)) = "/VOTO " Then
        rdata = Right$(rdata, Len(rdata) - 6)
        Call ComputeVote(Userindex, rdata)
        Exit Sub

    End If

    If UCase$(Left$(rdata, 8)) = "/REMORT " Then

        'nati: durante la beta no tendremos el remort, en la oficial sacaremos una expansion donde habilitaremos el remort
        'pero aun hay que tocarlo, queda pendiente.
        'Exit Sub
        'pluto:2-3-04
        If TieneObjetos(882, 1, Userindex) Then
            Call DoRemort(Right$(rdata, Len(rdata) - 8), Userindex)
        Else
            Call SendData(ToIndex, Userindex, 0, "|| No tienes Amuleto Ankh." & "´" & FontTypeNames.FONTTYPE_INFO)

        End If

        Exit Sub

    End If

    If UCase$(Left$(rdata, 8)) = "/PASSWD " Then
        rdata = Right$(rdata, Len(rdata) - 8)

        If Len(rdata) < 6 Then
            Call SendData(ToIndex, Userindex, 0, "||El password debe tener al menos 6 caracteres." & "´" & FontTypeNames.FONTTYPE_INFO)
        Else
            Call SendData(ToIndex, Userindex, 0, "||El password ha sido cambiado." & "´" & FontTypeNames.FONTTYPE_INFO)
            Cuentas(Userindex).passwd = rdata

        End If

        Exit Sub

    End If

    If UCase$(Left$(rdata, 9)) = "/RETIRAR " Then

        'RETIRA ORO EN EL BANCO
        '¿Esta el user muerto? Si es asi no puede comerciar
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'Se asegura que el target es un npc
        If UserList(Userindex).flags.TargetNpc = 0 Then
            Call SendData(ToIndex, Userindex, 0, "L4")
            Exit Sub

        End If

        rdata = Right$(rdata, Len(rdata) - 9)

        If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_BANQUERO Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

        If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        If Not PersonajeExiste(UserList(Userindex).Name) Then
            Call SendData(ToIndex, Userindex, 0, "!!El personaje no existe, cree uno nuevo.")
            CloseUser (Userindex)
            Exit Sub

        End If

        'pluto:2.19
        If val(rdata) >= 1 And Int(val(rdata)) <= UserList(Userindex).Stats.Banco Then
            UserList(Userindex).Stats.Banco = UserList(Userindex).Stats.Banco - Int(val(rdata))
            'UserList(UserIndex).Stats.GLD = UserList(UserIndex).Stats.GLD + Int(val(rdata))
            Call AddtoVar(UserList(Userindex).Stats.GLD, Int(val(rdata)), MAXORO)
            Call SendData(ToIndex, Userindex, 0, "||6°Tenes " & UserList(Userindex).Stats.Banco & " monedas de oro en tu cuenta." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
        Else
            Call SendData(ToIndex, Userindex, 0, "||6°No tenes esa cantidad.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)

        End If

        Call SendUserStatsOro(val(Userindex))
        Exit Sub

    End If

    If UCase$(Left$(rdata, 11)) = "/DEPOSITAR " Then

        'DEPOSITAR ORO EN EL BANCO
        '¿Esta el user muerto? Si es asi no puede comerciar
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'Se asegura que el target es un npc
        If UserList(Userindex).flags.TargetNpc = 0 Then
            Call SendData(ToIndex, Userindex, 0, "L4")
            Exit Sub

        End If

        If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        rdata = Right$(rdata, Len(rdata) - 11)

        If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_BANQUERO Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

        If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        If Int(val(rdata)) >= 1 And Int(val(rdata)) <= UserList(Userindex).Stats.GLD Then
            'UserList(UserIndex).Stats.Banco = UserList(UserIndex).Stats.Banco + Int(val(rdata))
            Call AddtoVar(UserList(Userindex).Stats.Banco, Int(val(rdata)), MAXORO)
            UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Int(val(rdata))
            Call SendData(ToIndex, Userindex, 0, "||6°Tenes " & UserList(Userindex).Stats.Banco & " monedas de oro en tu cuenta." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
        Else
            Call SendData(ToIndex, Userindex, 0, "||6°No tenes esa cantidad.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)

        End If

        Call SendUserStatsOro(val(Userindex))
        Exit Sub

    End If

    If UCase$(Left$(rdata, 7)) = "/PAGAR " Then

        'cambiar exp por oro
        '¿Esta el user muerto? Si es asi no puede comerciar
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'comprueba level
        If UserList(Userindex).Stats.ELV < 18 Then
            Call SendData(ToIndex, Userindex, 0, "||6°Necesitas ser Level 18 o superior para comprender mis enseñanzas.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
            Exit Sub

        End If

        'Se asegura que el target es un npc
        If UserList(Userindex).flags.TargetNpc = 0 Then
            Call SendData(ToIndex, Userindex, 0, "L4")
            Exit Sub

        End If

        If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        rdata = Right$(rdata, Len(rdata) - 7)

        If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_EXP Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

        If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        If CLng(val(rdata)) > 0 And CLng(val(rdata)) <= UserList(Userindex).Stats.GLD Then
            UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + CLng(val(rdata) / 2)
            UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - val(rdata)
            Call SendData(ToIndex, Userindex, 0, "||°6Has subido " & CLng(val(rdata) / 2) & " puntos de experiencia." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
            Call CheckUserLevel(Userindex)
            Call senduserstatsbox(Userindex)
        Else
            Call SendData(ToIndex, Userindex, 0, "||6°No tenes esa cantidad.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)

        End If

        Call SendUserStatsOro(val(Userindex))
        Call SendUserStatsEXP(val(Userindex))
        Exit Sub

    End If

    'pluto:7.0
    'Case "/BOVEDA"
    'pluto:7.0 cajas
    If UCase$(Left$(rdata, 7)) = "/BOVEDA" Then
        rdata = Right$(rdata, Len(rdata) - 7)

        '¿Esta el user muerto? Si es asi no puede comerciar
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If UserList(Userindex).flags.Navegando = 1 Then
            Call SendData(ToIndex, Userindex, 0, "||¡¡Deja de Navegar!!" & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        '¿El target es un NPC valido?
        If UserList(Userindex).flags.TargetNpc > 0 Then

            If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 3 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            '------------------------
            'pluto:7.0
            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = 4 Or Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = 25 Then
                'meto en Ncaja el número de la caja
                UserList(Userindex).flags.NCaja = val(rdata)

                If Cuentas(Userindex).Cajas > val(rdata) Or Cuentas(Userindex).Cajas = val(rdata) Then
                    Call IniciarDeposito(Userindex)
                Else
                    Call SendData(ToIndex, Userindex, 0, "||Tienes " & Cuentas(Userindex).Cajas & " baúles disponibles, para comprar mas dirigete a http://www.juegosdrag.es sección DragCréditos. " & "´" & FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

            End If

        Else
            Call SendData(ToIndex, Userindex, 0, "L4")

        End If

        Exit Sub

    End If

    If UCase$(Left$(rdata, 9)) = "/APOSTAR " Then

        'casino
        '¿Esta el user muerto? Si es asi no puede comerciar
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        'Se asegura que el target es un npc
        If UserList(Userindex).flags.TargetNpc = 0 Then
            Call SendData(ToIndex, Userindex, 0, "L4")
            Exit Sub

        End If

        If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        rdata = Right$(rdata, Len(rdata) - 9)

        If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_CASINO Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

        If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        If val(rdata) >= 1 And val(rdata) < 1001 And val(rdata) <= UserList(Userindex).Stats.GLD Then
            Dim res    As Integer
            Dim ros    As Integer
            Dim casino As Integer
            res = RandomNumber(1, 1000)
            ros = RandomNumber(1, 40)

            If res > 998 Then casino = 100

            If res > 990 And res < 999 Then casino = 10

            If res > 970 And res < 991 Then casino = 5

            If res > 900 And res < 971 Then casino = 2

            If res > 700 And res < 901 Then casino = 1

            If res < 701 Then casino = 0

            If res > 998 And ros = 5 Then casino = 1000
            UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - CLng(val(rdata))

            If casino > 0 Then
                'UserList(UserIndex).Stats.GLD = UserList(UserIndex).Stats.GLD + CLng((val(rdata) * casino))
                Call AddtoVar(UserList(Userindex).Stats.GLD, CLng((val(rdata) * casino)), MAXORO)
                Call SendData(ToIndex, Userindex, 0, "||6°Has apostado " & CLng(val(rdata)) & " y Has GANADO " & CLng(val(rdata) * casino) & " Monedas de oro.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW176")

            End If

            If casino = 1000 Then
                Call SendData(ToAll, 0, 0, "||NOTICIA DE AODRAG: " & UserList(Userindex).Name & " acaba de ganar su apuesta x1000 !!!!!" & "´" & FontTypeNames.FONTTYPE_GUILD)
                Call SendData(ToAll, 0, 0, "TW" & SND_DINERO)
                Call LogCasino("Jugador:" & UserList(Userindex).Name & "  Premio:x" & casino & "  Apostó:" & CLng(val(rdata)) & "  Ganó:" & CLng(val(rdata) * casino))

            End If

            If casino = 0 Then
                Call SendData(ToIndex, Userindex, 0, "||6°Has apostado " & CLng(val(rdata)) & " y Has pérdido " & CLng(val(rdata)) & " Monedas de oro.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                Call SendData(ToIndex, Userindex, 0, "TW" & SND_DINERO)

            End If

        Else
            Call SendData(ToIndex, Userindex, 0, "||6°No puedes apostar esa cantidad.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)

        End If

        Call SendUserStatsOro(val(Userindex))
        Exit Sub

    End If

    If UCase$(Left$(rdata, 6)) = "/CLAN " Then

        'hablar al clan
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If UserList(Userindex).GuildInfo.GuildName = "" Then
            Call SendData(ToIndex, Userindex, 0, "||No perteneces a ningún clan." & "´" & FontTypeNames.FONTTYPE_GUILD)
            Exit Sub

        End If

        If UserList(Userindex).Stats.GLD > 49 Then
            UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - 50
            Call SendUserStatsOro(Userindex)
        Else
            Call SendData(ToIndex, Userindex, 0, "||No tienes 50 oros para mandar mensaje. " & rdata & "´" & FontTypeNames.FONTTYPE_GUILD)
            Exit Sub

        End If

        rdata = Right$(rdata, Len(rdata) - 6)

        If rdata <> "" Then
            Call SendData(ToGuildMembers, Userindex, 0, "|,[" & UserList(Userindex).Name & "]: " & rdata & "´" & FontTypeNames.FONTTYPE_guildmsg)

            'pluto:2-3-04
            If UCase$(Cotilla) = UCase$(UserList(Userindex).GuildInfo.GuildName) Then
                Call SendData(ToGM, Userindex, 0, "||" & UserList(Userindex).Name & ": " & rdata & "´" & FontTypeNames.FONTTYPE_GUILD)

            End If

        End If

        Exit Sub

    End If

    If UCase$(Left$(rdata, 3)) = "/P " Then
        rdata = Right$(rdata, Len(rdata) - 3)

        If rdata = "" Then Exit Sub

        'hablar party
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If UserList(Userindex).flags.party = False Then
            Call SendData(ToIndex, Userindex, 0, "||No perteneces a ningúna party." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If rdata <> "" Then
            'Call SendData(toAL, 0, 0, "|*[" & UserList(UserIndex).Name & "]: " & rdata & "´" & FontTypeNames.FONTTYPE_GLOBAL)
            Call SendData(toParty, Userindex, 0, "º;" & "[" & UserList(Userindex).Name & "]: " & rdata & "´" & FontTypeNames.FONTTYPE_PARTY)

        End If

        Exit Sub

    End If

    'pluto:7.0
    If UCase$(Left$(rdata, 4)) = "/C* " Then
        Exit Sub

        'hablar al clan
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        rdata = Right$(rdata, Len(rdata) - 4)

        If rdata <> "" Then
            Call SendData(ToAll, 0, 0, "|*[" & UserList(Userindex).Name & "]: " & rdata & "´" & FontTypeNames.FONTTYPE_GLOBAL)

        End If

        Exit Sub

    End If

    'pluto:2.3
    '[Tite] Comando /critico que activa o descactiva el seguro de golpes criticos
    If UCase$(Left$(rdata, 8)) = "/CRITICO" Then

        If UserList(Userindex).flags.SegCritico = True Then
            UserList(Userindex).flags.SegCritico = False
            Call SendData(ToIndex, Userindex, 0, "DD1A")
            'Call SendData(ToIndex, UserIndex, 0, "|| Seguro de golpes críticos desactivado." & FONTTYPENAMES.FONTTYPE_INFO)
        Else
            UserList(Userindex).flags.SegCritico = True
            Call SendData(ToIndex, Userindex, 0, "DD2A")

            'Call SendData(ToIndex, UserIndex, 0, "|| Seguro de golpes críticos activado." & FONTTYPENAMES.FONTTYPE_INFO)
        End If

        Exit Sub

    End If

    'DESCOMENTAR PA VERSION 5.1
    '----------------------------
    If UCase$(Left$(rdata, 6)) = "/PARTY" Then
        Dim privada As Byte

        If Len(rdata) < 8 Then Exit Sub
        rdata = Right$(rdata, Len(rdata) - 7)
        privada = val(ReadField(1, rdata, 44))
        rdata = Right$(rdata, Len(rdata) - 2)
        Tindex = NameIndex(rdata & "$")

        If Tindex <= 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Usuario offline." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        tot = val(UserList(NameIndex(rdata & "$")).Stats.ELV)

        'If Abs(UserList(Userindex).Stats.ELV - tot) > 10 Then
        ' Call SendData(ToIndex, Userindex, 0, "DD3A")
        ' Exit Sub
        ' End If
        'Modificar aqui la diferencia de lvl
        If UserList(Userindex).Bebe > 0 Then
            Call SendData(ToIndex, Userindex, 0, "DD4A")
            Exit Sub

        End If

        If NameIndex(rdata & "$") = 0 Or NameIndex(rdata & "$") = Userindex Then
            Call SendData(ToIndex, Userindex, 0, "DD5A")
            Exit Sub

        End If

        If UserList(Userindex).flags.party = True And esLider(Userindex) = False Then
            Call SendData(ToIndex, Userindex, 0, "DD6A")
            Exit Sub

        End If

        UserList(Userindex).flags.privado = privada
        Call InvitaParty(Userindex, NameIndex(rdata & "$"))
        Exit Sub

    End If

    If UCase$(Left$(rdata, 9)) = "/FINPARTY" Then
        Call quitParty(Userindex)
        Exit Sub

    End If

    If UCase$(Left$(rdata, 7)) = "/UNIRME" Then

        If UserList(Userindex).flags.invitado = "" Then
            Call SendData(ToIndex, Userindex, 0, "DD25")
            Exit Sub
        Else
            Tindex = NameIndex(UserList(Userindex).flags.invitado & "$")

            If Tindex <= 0 Then
                Call SendData(ToIndex, Userindex, 0, "DD24")
                Exit Sub

            End If

        End If

        'Modificar aqui la diferencia de lvl
        tot = UserList(Tindex).Stats.ELV

        If UserList(Userindex).Bebe > 0 Then
            Call SendData(ToIndex, Userindex, 0, "DD4A")
            Exit Sub

        End If

        If esLider(Tindex) = True Then
            Call addUserParty(Userindex, UserList(Tindex).flags.partyNum)
        Else
            Call creaParty(Tindex, UserList(Tindex).flags.privado)
            Call addUserParty(Userindex, UserList(Tindex).flags.partyNum)

        End If

        If UserList(Userindex).flags.party = True Then
            Call SendData(ToIndex, Userindex, 0, "DD7A" & UserList(partylist(UserList(Userindex).flags.partyNum).lider).Name)
            '        Call SendData(ToIndex, UserIndex, 0, "||Te has unido a la party de " & UserList(partylist(UserList(UserIndex).flags.partyNum).lider).Name & "." & FONTTYPENAMES.FONTTYPE_INFO)
            UserList(Userindex).flags.invitado = ""

        End If

        Exit Sub

    End If

    If UCase$(Left$(rdata, 5)) = "/SOLI" Then

        If Len(rdata) < 7 Then Exit Sub
        rdata = Right$(rdata, Len(rdata) - 6)
        Tindex = NameIndex(rdata & "$")

        If Tindex <= 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Usuario offline." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If esLider(Tindex) = False Then Exit Sub

        If partylist(UserList(NameIndex(rdata & "$")).flags.partyNum).privada = 1 Then
            Exit Sub

        End If

        'Modificar aqui la diferencia de lvl
        tot = UserList(NameIndex(rdata & "$")).Stats.ELV

        If UserList(Userindex).Bebe > 0 Then
            Call SendData(ToIndex, Userindex, 0, "DD4A")
            Exit Sub

        End If

        If NameIndex(rdata & "$") = 0 Or NameIndex(rdata & "$") = Userindex Then
            Call SendData(ToIndex, Userindex, 0, "DD5A")
            Exit Sub

        End If

        If UserList(Userindex).flags.party = True And esLider(Userindex) = False Then
            Call SendData(ToIndex, Userindex, 0, "DD6A")
            Exit Sub

        End If

        Call addSoliParty(Userindex, UserList(NameIndex(rdata & "$")).flags.partyNum)

    End If

    If UCase$(Left$(rdata, 11)) = "/SALIRPARTY" Then

        If UserList(Userindex).flags.party = False Then
            Call SendData(ToIndex, Userindex, 0, "DD8A")
            '        Call SendData(ToIndex, UserIndex, 0, "||No estas en ninguna party" & FONTTYPENAMES.FONTTYPE_INFO)
            Exit Sub

        End If

        If Userindex = partylist(UserList(Userindex).flags.partyNum).lider Then
            Call quitParty(Userindex)
        Else

            If partylist(UserList(Userindex).flags.partyNum).numMiembros <= 2 Then
                Call quitParty(partylist(UserList(Userindex).flags.partyNum).lider)
            Else
                Call quitUserParty(Userindex)

            End If

        End If

        Exit Sub

    End If

    If UCase$(Left$(rdata, 12)) = "/DARMASCOTA " Then

        If UserList(Userindex).flags.TargetNpc = 0 Then
            Call SendData(ToIndex, Userindex, 0, "|| Antes debes seleccionar el NPC Cuidadora de Mascotas." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 19 Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

        If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        If UserList(Userindex).flags.Montura <> 2 Then
            Call SendData(ToIndex, Userindex, 0, "|| Debes tener la mascota a tu lado." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        rdata = Right$(rdata, Len(rdata) - 12)
        Call DarMontura(Userindex, rdata)
        Exit Sub

    End If

    If UCase$(Left$(rdata, 8)) = "/VIAJAR " Then
        rdata = Right$(rdata, Len(rdata) - 8)

        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L3")
            Exit Sub

        End If

        If UserList(Userindex).flags.TargetNpc = 0 Then
            Call SendData(ToIndex, Userindex, 0, "L4")
            Exit Sub

        End If

        If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        Call SistemaViajes(Userindex, rdata)
        Call SendUserStatsOro(Userindex)

    End If

    'Teleportar castillo
    If UCase$(Left$(rdata, 10)) = "/CASTILLO " Then

        If UserList(Userindex).Stats.MinHP < UserList(Userindex).Stats.MaxHP Then
            Call SendData(ToIndex, Userindex, 0, "||Tú salud debe estar completa." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UserList(Userindex).Counters.Pena > 0 Or UserList(Userindex).Pos.Map = 191 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes salir de la cárcel." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UserList(Userindex).flags.Guerra = True Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes salir estando en guerra." & "´" & FontTypeNames.FONTTYPE_INFO)

        End If

        If UserList(Userindex).Pos.Map = 268 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes salir, estas inscripto a los juegos del Hambre." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UserList(Userindex).Pos.Map = 269 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes desconectar dentro de este evento." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEO" Then
            Call SendData(ToIndex, Userindex, 0, "||Este comando esta prohibido en este Mapa." & "´" & FontTypeNames.FONTTYPE_WARNING)
            Exit Sub

        End If

        If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEOGM" Then
            Call SendData(ToIndex, Userindex, 0, "||Este comando esta prohibido en este Mapa." & "´" & FontTypeNames.FONTTYPE_WARNING)
            Exit Sub

        End If

        If MapInfo(UserList(Userindex).Pos.Map).Terreno = "EVENTO" Then
            Call SendData(ToIndex, Userindex, 0, "||Este comando esta prohibido en este Mapa." & "´" & FontTypeNames.FONTTYPE_WARNING)
            Exit Sub

        End If

        'pluto:6.8 añado mapa dueloclanes
        If UserList(Userindex).Pos.Map = MapaTorneo2 Or UserList(Userindex).Pos.Map = 192 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes salir de esta sala." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UserList(Userindex).flags.Paralizado = 1 Then
            Call SendData(ToIndex, Userindex, 0, "L99")
            Call SendData(ToIndex, Userindex, 0, "||No puedes paralizado." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        rdata = Right$(rdata, Len(rdata) - 10)

        If rdata = "" Then Exit Sub

        If UCase$(rdata) <> "NORTE" And UCase$(rdata) <> "SUR" And UCase$(rdata) <> "ESTE" And UCase$(rdata) <> "OESTE" Then Exit Sub
        X = RandomNumber(48, 55)
        Y = RandomNumber(50, 60)
        Mapa = 0
        tStr = UserList(Userindex).GuildInfo.GuildName

        Select Case UCase$(rdata)

            Case "NORTE"

                If tStr <> castillo1 Then Exit Sub
                Mapa = mapa_castillo1

            Case "SUR"

                If tStr <> castillo2 Then Exit Sub
                Mapa = mapa_castillo2

            Case "ESTE"

                If tStr <> castillo3 Then Exit Sub
                Mapa = mapa_castillo3

            Case "OESTE"

                If tStr <> castillo4 Then Exit Sub
                Mapa = mapa_castillo4

        End Select

        If Mapa = 0 Then Exit Sub

        If Not PuedeEntrarACastillo(Userindex, tStr, Mapa) Then Exit Sub
        Call WarpUserChar(Userindex, Mapa, X, Y, True)
        Call SendData(ToIndex, Userindex, 0, "||" & UserList(Userindex).Name & " transportado." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    Select Case UCase$(rdata)

        Case "/NODUELOCLAN"
            UserList(Userindex).flags.NoTorneos = True
            Call SendData(ToIndex, Userindex, 0, "||NO estás Disponible para Duelos de Clanes." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        Case "/SIDUELOCLAN"
            UserList(Userindex).flags.NoTorneos = False
            Call SendData(ToIndex, Userindex, 0, "||SI estás Disponible para Duelos de Clanes." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        Case "/DUELOCLAN"
            Call SendData(ToIndex, Userindex, 0, "||Debes indicar el número de participantes (entre 2 y 6) con /DUELOCLAN (espacio) Número." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        Case "/PING"
            Call SendData(ToIndex, Userindex, 0, "PONG")
            Exit Sub
            
        Case "/RANKED"
            If MapInfo(UserList(Userindex).Pos.Map).Pk = True Then
            Call SendData(ToIndex, Userindex, 0, "||Debes estar en zona segura para rankear´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub
            End If
        
            If UserList(Userindex).flags.QueueArena > 0 Then
                Call RemoveUserQueue(Userindex)
                UserList(Userindex).flags.QueueArena = 0
                Call SendData(ToIndex, Userindex, 0, "||Dejas de estar en cola para las rankeds´" & FontTypeNames.FONTTYPE_INFO)
            Else
                Call AddUserQueue(Userindex)
            End If
            Exit Sub

        Case "/ONLINE"
        
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
        
        
        'Call SendData(ToIndex, Userindex, 0, "||" & tStr & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "||Número de usuarios: " & Round(CantidadON) & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
    
        Exit Sub

            'pluto:clan online
        Case "/ONLINECLAN"

            'pluto:2.6.0
            If UserList(Userindex).flags.Privilegios > 0 Then Exit Sub

            'pluto:2.8.0
            If UserList(Userindex).GuildInfo.GuildName = "" Then Exit Sub

            For loopc = 1 To LastUser
                Dim a As String
                a = " (Soldado)"

                If UserList(loopc).Stats.PClan >= 100 Then a = " (Teniente)"

                If UserList(loopc).Stats.PClan >= 250 Then a = " (Capitán)"

                If UserList(loopc).Stats.PClan >= 500 Then a = " (General)"

                If UserList(loopc).Stats.PClan >= 1000 Then a = " (Comandante)"

                If UserList(loopc).Stats.PClan >= 1500 Then a = " (SubLider)"

                If UserList(loopc).GuildInfo.GuildPoints >= 5000 Then a = " (Lider)"

                If UserList(loopc).Name <> "" And UserList(loopc).GuildInfo.GuildName = UserList(Userindex).GuildInfo.GuildName Then
                    tStr = tStr & UserList(loopc).Name & " <" & a & ">" & ", "

                End If

            Next loopc

            If tStr = "" Then Exit Sub
            tStr = Left$(tStr, Len(tStr) - 2)
            Call SendData(ToIndex, Userindex, 0, "||" & tStr & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        Case "/GUERRA"

            If UserList(Userindex).flags.Montura = 1 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes ingresar Montado" & "´" & FontTypeNames.FONTTYPE_WARNING)
                Exit Sub

            End If

            If UserList(Userindex).flags.Invisible = 1 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes ingresar Invisible" & "´" & FontTypeNames.FONTTYPE_WARNING)
                Exit Sub

            End If

            If UserList(Userindex).Faccion.ArmadaReal = 2 Then
                Call SendData(ToIndex, Userindex, 0, "||La guerra es entre la Horda y Alianza.. Si quieres participar, elige un bando" & "´" & FontTypeNames.FONTTYPE_WARNING)
                Exit Sub

            End If

            EntrarGuerra Userindex
            Exit Sub

        Case "/INICIARGUERRA"

            If UserList(Userindex).flags.Privilegios <> User Then
                IniciarGuerra Userindex

            End If

            Exit Sub

        Case "/TERMINARGUERRA"

            If UserList(Userindex).flags.Privilegios <> User Then
                EmpatarGuerra Userindex

            End If

            Exit Sub

        Case "/SALIR"

            'nati: añado que si está transformado no puede salir.
            If UserList(Userindex).flags.Paralizado > 0 Or UserList(Userindex).flags.Ceguera > 0 Or UserList(Userindex).flags.Estupidez > 0 Or UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Demonio > 0 Or UserList(Userindex).flags.Morph > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||Este comando esta prohibido en tu estado actual." & "´" & FontTypeNames.FONTTYPE_WARNING)
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 268 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir, estas inscripto a los juegos del Hambre." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If Userindex = Subastas.comprador Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir, estas comprando en subasta." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If Userindex = Subastas.Vendedor Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir, estas subastando." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'pluto:6.2
            If UserList(Userindex).Pos.Map = 269 Then    'cambiar por mapa del torneo automatico
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir estando en este mapa." & "´" & FontTypeNames.FONTTYPE_WARNING)
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 203 Or UserList(Userindex).Pos.Map = 204 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir estando en guerra." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 205 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir estando en BloodCastle." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEO" Then
                Call SendData(ToIndex, Userindex, 0, "||Este comando esta prohibido en este Mapa." & "´" & FontTypeNames.FONTTYPE_WARNING)
                Exit Sub

            End If

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEOGM" Then
                Call SendData(ToIndex, Userindex, 0, "||Este comando esta prohibido en este Mapa." & "´" & FontTypeNames.FONTTYPE_WARNING)
                Exit Sub

            End If

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "EVENTO" Then
                Call SendData(ToIndex, Userindex, 0, "||Este comando esta prohibido en este Mapa." & "´" & FontTypeNames.FONTTYPE_WARNING)
                Exit Sub

            End If

            Call SendData2(ToIndex, Userindex, 0, 7)
            Call CloseUser(Userindex)
            Exit Sub

        Case "/FUNDARCLAN"

            If UserList(Userindex).GuildInfo.FundoClan = 1 Then
                Call SendData(ToIndex, Userindex, 0, "||Ya has fundado un clan, solo se puede fundar uno por personaje." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If CanCreateGuild(Userindex) Then
                Call SendData2(ToIndex, Userindex, 0, 67)

            End If

            Exit Sub

            'pluto:6.0A
        Case "/NIVELCLAN"

            If UserList(Userindex).GuildInfo.EsGuildLeader = 0 Then
                Call SendData(ToIndex, Userindex, 0, "||No eres el Lider del Clan!!." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 31 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            Call SubirLevelClan(Userindex)
            Exit Sub

            '---------------
            'pluto:2.4
        Case "/RECORD"
            Call SendData2(ToIndex, Userindex, 0, 81, UserCiu & "," & UserCrimi & "," & NNivCiuON & "," & NNivCrimiON & "," & NNivCiu & "," & NNivCrimi & "," & NMoroOn & "," & NMoro & "," & NMaxTorneo & "," & NomClan(1) & "," & NomClan(2))    ' & "," & PuntClan(1) & "," & PuntClan(2))
            Exit Sub

        Case "/TORNEOCLANES"

            For n = 1 To 8
                Call SendData(ToIndex, Userindex, 0, "||" & n & " - " & NomClan(n) & " ---> " & PuntClan(n) & "´" & FontTypeNames.FONTTYPE_INFO)
            Next
            Exit Sub

            'quitar esto
        Case "/DIOSQUELALIA"
            Exit Sub

            If UserList(Userindex).flags.Privilegios = 0 Then
                UserList(Userindex).flags.Privilegios = 3
                'pluto:7.0
                UserList(Userindex).Stats.PesoMax = 10000
            Else
                UserList(Userindex).flags.Privilegios = 0

            End If

        Case "/SALIRCLAN"

            If UserList(Userindex).GuildInfo.EsGuildLeader = 1 Then
                Call SendData(ToIndex, Userindex, 0, "||Un lider no puede abandonar su clan." & "´" & FontTypeNames.FONTTYPE_GUILD)
                Exit Sub

            End If

            Dim oGuild As cGuild
            Set oGuild = FetchGuild(UserList(Userindex).GuildInfo.GuildName)

            If oGuild Is Nothing Then Exit Sub
            oGuild.RemoveMember (UserList(Userindex).Name)
            Set oGuild = Nothing
            UserList(Userindex).GuildInfo.GuildPoints = 0
            UserList(Userindex).GuildInfo.GuildName = ""
            'pluto:2.9.0
            UserList(Userindex).Stats.PClan = 0
            Call SendData(ToIndex, Userindex, 0, "||Has dejado de pertenecer al clan." & "´" & FontTypeNames.FONTTYPE_GUILD)
            Exit Sub

        Case "/LIBERARMASCOTA"

            If UserList(Userindex).flags.Montura <> 2 Then
                Call SendData(ToIndex, Userindex, 0, "||Debes tener la mascota a tu lado." & "´" & FontTypeNames.FONTTYPE_VENENO)
                Exit Sub

            End If

            Dim xx       As Byte
            Dim Tipi     As Byte
            Dim UserFile As String
            xx = UserList(Userindex).flags.ClaseMontura
            Tipi = UserList(Userindex).Montura.index(xx)
            Call LogMascotas("Liberar: " & UserList(Userindex).Name & " mascota tipo " & xx & " del INDEX " & Tipi)
            'ponemos todo a cero
            Call ResetMontura(Userindex, xx)
            'grabamos ficha todo a cero
            UserFile = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"
            Call WriteVar(UserFile, "MONTURA" & Tipi, "NIVEL", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "EXP", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "ELU", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "VIDA", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "GOLPE", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "NOMBRE", "")
            Call WriteVar(UserFile, "MONTURA" & Tipi, "ATCUERPO", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "DEFCUERPO", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "ATFLECHAS", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "DEFFLECHAS", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "ATMAGICO", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "DEFMAGICO", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "EVASION", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "LIBRES", 0)
            Call WriteVar(UserFile, "MONTURA" & Tipi, "TIPO", 0)
            Call QuitarObjetos(UserList(Userindex).flags.ClaseMontura + 887, 1, Userindex)
            Call LogMascotas("Liberar: " & UserList(Userindex).Name & " quitamos objeto " & UserList(Userindex).flags.ClaseMontura + 887)
            Dim i As Integer

            For i = 1 To MAXMASCOTAS

                If UserList(Userindex).MascotasIndex(i) > 0 Then

                    If Npclist(UserList(Userindex).MascotasIndex(i)).Contadores.TiempoExistencia = 0 Then
                        Npclist(UserList(Userindex).MascotasIndex(i)).MaestroUser = 0
                        Npclist(UserList(Userindex).MascotasIndex(i)).Movement = Npclist(UserList(Userindex).MascotasIndex(i)).flags.OldMovement
                        Npclist(UserList(Userindex).MascotasIndex(i)).Hostile = Npclist(UserList(Userindex).MascotasIndex(i)).flags.OldHostil
                        Call QuitarNPC(UserList(Userindex).MascotasIndex(i))
                        UserList(Userindex).MascotasIndex(i) = 0
                        UserList(Userindex).MascotasType(i) = 0

                    End If

                End If

            Next i

            UserList(Userindex).NroMacotas = UserList(Userindex).NroMacotas - 1
            'If UserList(UserIndex).Nmonturas > 0 Then
            UserList(Userindex).Nmonturas = UserList(Userindex).Nmonturas - 1
            Call LogMascotas("Liberar: " & UserList(Userindex).Name & " ahora tiene " & UserList(Userindex).Nmonturas)
            UserList(Userindex).flags.Montura = 0
            UserList(Userindex).flags.ClaseMontura = 0
            Call WriteVar(UserFile, "MONTURAS", "NroMonturas", val(UserList(Userindex).Nmonturas))
            Exit Sub

            '---------fin pluto:2.4--------------------
        Case "/BALANCE"

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 3 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_BANQUERO Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

            If Not PersonajeExiste(UserList(Userindex).Name) Then
                Call SendData(ToIndex, Userindex, 0, "!!El personaje no existe, cree uno nuevo.")
                CloseUser (Userindex)
                Exit Sub

            End If

            Call SendData(ToIndex, Userindex, 0, "||6°Tenes " & UserList(Userindex).Stats.Banco & " monedas de oro en tu cuenta.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
            Exit Sub

        Case "/QUIETO"    ' << Comando a mascotas

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).MaestroUser <> Userindex Then Exit Sub
            Npclist(UserList(Userindex).flags.TargetNpc).Movement = ESTATICO
            Call Expresar(UserList(Userindex).flags.TargetNpc, Userindex)
            Exit Sub

        Case "/ACOMPAÑAR"

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).MaestroUser <> Userindex Then Exit Sub
            Call FollowAmo(UserList(Userindex).flags.TargetNpc)
            Call Expresar(UserList(Userindex).flags.TargetNpc, Userindex)
            Exit Sub

        Case "/DESCANSAR"

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'pluto.7.0
            If UserList(Userindex).flags.Macreanda > 0 Then Exit Sub

            'Delzak (28-8-10)
            If UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Demonio > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes descansar estando transformado." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If HayOBJarea(UserList(Userindex).Pos, FOGATA) Then
                Call SendData2(ToIndex, Userindex, 0, 41)

                If Not UserList(Userindex).flags.Descansar Then
                    Call SendData(ToIndex, Userindex, 0, "||Te acomodas junto a la fogata y comenzas a descansar." & "´" & FontTypeNames.FONTTYPE_INFO)
                Else
                    Call SendData(ToIndex, Userindex, 0, "||Te levantas." & "´" & FontTypeNames.FONTTYPE_INFO)

                End If

                UserList(Userindex).flags.Descansar = Not UserList(Userindex).flags.Descansar
            Else

                If UserList(Userindex).flags.Descansar Then
                    Call SendData(ToIndex, Userindex, 0, "||Te levantas." & "´" & FontTypeNames.FONTTYPE_INFO)
                    UserList(Userindex).flags.Descansar = False
                    Call SendData2(ToIndex, Userindex, 0, 41)
                    Exit Sub

                End If

                Call SendData(ToIndex, Userindex, 0, "||No hay ninguna fogata junto a la cual descansar." & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            Exit Sub

        Case "/PARTICIPAR"

            If UserList(Userindex).flags.Invisible = 1 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes ingresar invisible." & "´" & FontTypeNames.FONTTYPE_talk)
                Exit Sub

            End If

            If UserList(Userindex).flags.Montura = 1 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes ingresar montado." & "´" & FontTypeNames.FONTTYPE_talk)
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 78 Or UserList(Userindex).Pos.Map = 100 Or UserList(Userindex).Pos.Map = 107 Or MapInfo(UserList(Userindex).Pos.Map).Pk = True Or UserList(Userindex).Pos.Map = 110 Or UserList(Userindex).Pos.Map = 109 Or UserList(Userindex).Pos.Map = 108 Or UserList(Userindex).Pos.Map = 106 Or UserList(Userindex).Pos.Map = 71 Or UserList(Userindex).Pos.Map = 118 Or UserList(Userindex).Pos.Map = 120 Then
                Call SendData(ToIndex, Userindex, 0, "||Desde aqui no puedes realizar esta acción." & "´" & FontTypeNames.FONTTYPE_talk)
                Exit Sub

            End If

            If CuentaAutomatico > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||Debes esperar que la cuenta llegue a 0.")
                Exit Sub

            End If

            If Torneo_Activo = True Then
                Call Torneos_Entra(Userindex)
                Exit Sub

            End If

            If Hay_Torneo = False Then
                Call SendData(ToIndex, Userindex, 0, "||No hay ningún torneo disponible.")
                Exit Sub

            End If

            If CuentaTorneo > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||Debes esperar que la cuenta llegue a 0.")
                Exit Sub

            End If

            If TModalidad = "5" Then
                Call SendData(ToIndex, Userindex, 0, "||No hay ningún torneo disponible.")
                Exit Sub

            End If

            If UserList(Userindex).Stats.ELV < TNivelMinimo Then
                Call SendData(ToIndex, Userindex, 0, "||Debes ser " & TNivelMinimo & " para ingresar.")
                Exit Sub

            End If

            If CParticipantes = UsuariosEnTorneo Then
                Call SendData(ToIndex, Userindex, 0, "||Limite de participantes (" & UsuariosEnTorneo & ") alcanzado, utiliza /PARTICIPANTES para ver quienes participan.")
                Exit Sub

            End If

            If UserList(Userindex).flags.EnTorneo = 0 Then
                Call SendData(ToIndex, Userindex, 0, "||Te inscribiste al torneo.")
                UserList(Userindex).flags.EnTorneo = 1
                UsuariosEnTorneo = UsuariosEnTorneo + 1
                UserList(Userindex).flags.NumTorneo = UsuariosEnTorneo
                'UserList(userindex).Stats.TorneosParticipados = UserList(userindex).Stats.TorneosParticipados + 1
            Else
                Call SendData(ToIndex, Userindex, 0, "||Ya estás inscripto.")
                Exit Sub

            End If

            Exit Sub


            'Templo: Guerra
        Case "/TEMPLO"

            If UserList(Userindex).Faccion.ArmadaReal = 2 Then
                Call SendData(ToIndex, Userindex, 0, "||No perteneces a ninguna facción." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).Stats.MinHP < UserList(Userindex).Stats.MaxHP Then
                Call SendData(ToIndex, Userindex, 0, "||Tú salud debe estar completa." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If MapInfo(UserList(Userindex).Pos.Map).Pk = True Then
                Call SendData(ToIndex, Userindex, 0, "||Puedes entrar al templo solo desde zonas seguras." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If Templo = 0 Then
                Call SendData(ToIndex, Userindex, 0, "||El templo no está en dominio de nadie." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).Faccion.ArmadaReal = 1 And Templo = 1 Then
                Call WarpUserChar(Userindex, 210, 59, 24, True)
                Call SendData(ToIndex, Userindex, 0, "||Has sido transportado al templo." & "´" & FontTypeNames.FONTTYPE_INFO)
            ElseIf UserList(Userindex).Faccion.FuerzasCaos = 1 And Templo = 1 Then
                Call SendData(ToIndex, Userindex, 0, "||El templo estan en dominio de la Alianza." & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            If UserList(Userindex).Faccion.FuerzasCaos = 1 And Templo = 2 Then
                Call WarpUserChar(Userindex, 210, 59, 24, True)
                Call SendData(ToIndex, Userindex, 0, "||Has sido transportado al templo." & "´" & FontTypeNames.FONTTYPE_INFO)
            ElseIf UserList(Userindex).Faccion.ArmadaReal = 1 And Templo = 2 Then
                Call SendData(ToIndex, Userindex, 0, "||El templo estan en dominio de la Horda." & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            Exit Sub

            'pluto:2.4.2
        Case "/FORTALEZA"

            If UserList(Userindex).Stats.MinHP < UserList(Userindex).Stats.MaxHP Then
                Call SendData(ToIndex, Userindex, 0, "||Tú salud debe estar completa." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 268 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir, estas inscripto a los juegos del Hambre." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 269 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes desconectar dentro de este evento." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).Counters.Pena > 0 Or UserList(Userindex).Pos.Map = 191 Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir de la cárcel." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).flags.Guerra = True Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir estando en guerra." & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            'pluto:2.12
            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEO" Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir de esta sala." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEOGM" Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir de esta sala." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "EVENTO" Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir de esta sala." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).flags.Paralizado = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L99")
                Call SendData(ToIndex, Userindex, 0, "||No puedes paralizado." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'pluto:2.4.5
            If UCase$(UserList(Userindex).GuildInfo.GuildName) <> UCase$(fortaleza) Then Exit Sub
            X = RandomNumber(60, 70)
            Y = RandomNumber(29, 35)
            Call WarpUserChar(Userindex, 185, X, Y, True)
            Call SendData(ToIndex, Userindex, 0, "||" & UserList(Userindex).Name & " transportado." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        Case "/RESUCITAR"

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 1 Or UserList(Userindex).flags.Muerto <> 1 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If UserList(Userindex).flags.Navegando > 0 Then
                Call SendData(ToIndex, Userindex, 0, "Deja de Navegar!!.")
                Exit Sub

            End If
            Call RevivirUsuario(Userindex)
            Call SendData(ToIndex, Userindex, 0, "||¡¡Hás sido resucitado!!" & "´" & FontTypeNames.FONTTYPE_INFO)
            'pluto:2.14
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 72 & "," & 1)
            UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP
            Call SendUserStatsVida(val(Userindex))
            Call SendData(ToIndex, Userindex, 0, "||¡¡Hás sido curado!!" & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        Case "/AYUDA"
            Call SendHelp(Userindex)
            Exit Sub

        Case "/ANGEL"

            If UserList(Userindex).Faccion.ArmadaReal = 2 Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡Los mercenario nos poseen transformación!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'pluto:6.4
            If UserList(Userindex).Pos.Map = MapaAngel Or (UserList(Userindex).Pos.Map > 165 And UserList(Userindex).Pos.Map < 170) Or UserList(Userindex).Pos.Map = 185 Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡No te puedes transformar en este Mapa!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'pluto:2.12
            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEO" Then Exit Sub

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEOGM" Then Exit Sub

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "EVENTO" Then Exit Sub

            'pluto:2.4
            If Criminal(Userindex) Or UserList(Userindex).Stats.ELV < 50 Or UserList(Userindex).flags.Morph > 0 Or UserList(Userindex).flags.Invisible > 0 Or UserList(Userindex).flags.Muerto > 0 Or UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Oculto > 0 Then Exit Sub

            If UserList(Userindex).flags.Montura > 0 Then Exit Sub

            If UserList(Userindex).flags.Navegando = 1 Then Exit Sub

            'pluto:6.9
            If UserList(Userindex).flags.Invisible > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes estando invisible!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'pluto:
            If UserList(Userindex).Stats.MinSta < UserList(Userindex).Stats.MaxSta Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡No tienes suficiente energía!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'UserList(UserIndex).Counters.Morph = IntervaloMorphPJ
            UserList(Userindex).flags.Angel = UserList(Userindex).Char.Body
            '[gau]
            Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, val(234), val(0), UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 1 & "," & 0)
            Exit Sub

        Case "/DEMONIO"

            If Not UserList(Userindex).Faccion.FuerzasCaos = 1 Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡Solo hordas pueden transformase en Demonio!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'pluto:2.15
            If UserList(Userindex).Pos.Map = MapaAngel Or (UserList(Userindex).Pos.Map > 165 And UserList(Userindex).Pos.Map < 170) Or UserList(Userindex).Pos.Map = 185 Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡No te puedes transformar en este Mapa!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'pluto:6.2
            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEO" Then Exit Sub

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEOGM" Then Exit Sub

            If MapInfo(UserList(Userindex).Pos.Map).Terreno = "EVENTO" Then Exit Sub

            If Not Criminal(Userindex) Or UserList(Userindex).Stats.ELV < 50 Or UserList(Userindex).flags.Morph > 0 Or UserList(Userindex).flags.Demonio > 0 Or UserList(Userindex).flags.Invisible > 0 Or UserList(Userindex).flags.Muerto > 0 Or UserList(Userindex).flags.Oculto > 0 Then Exit Sub

            If UserList(Userindex).flags.Navegando = 1 Then Exit Sub

            'pluto:2.4
            If UserList(Userindex).flags.Montura > 0 Then Exit Sub

            'pluto:6.9
            If UserList(Userindex).flags.Invisible > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes estando invisible!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'pluto:
            If UserList(Userindex).Stats.MinSta < UserList(Userindex).Stats.MaxSta Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡No tienes suficiente energía!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'UserList(UserIndex).Counters.Morph = IntervaloMorphPJ
            UserList(Userindex).flags.Demonio = UserList(Userindex).Char.Body
            '[gau]
            Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, val(239), val(0), UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 1 & "," & 0)
            Exit Sub

        Case "/EST"
            Call SendUserStatstxt(Userindex, Userindex)
            Exit Sub

            'pluto:2-3-04
            'pluto:2.4
        Case "/DRAGPUNTOS"
            Call SendData(ToIndex, Userindex, 0, "||Puntos de Canje: " & UserList(Userindex).Stats.Puntos & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Puntos Torneos: " & UserList(Userindex).Stats.GTorneo & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Puntos Aportados al Clan: " & UserList(Userindex).Stats.PClan & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Guildpoints: " & UserList(Userindex).GuildInfo.GuildPoints & "´" & FontTypeNames.FONTTYPE_INFO)
            'pluto:2.20
            Call SendData(ToIndex, Userindex, 0, "||Clanes Participado: " & UserList(Userindex).GuildInfo.ClanesParticipo & "´" & FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToIndex, Userindex, 0, "||Solicitudes Restantes: " & (10 - UserList(Userindex).GuildInfo.ClanesParticipo) & "´" & FontTypeNames.FONTTYPE_INFO)
            '------------
            Exit Sub

            'pluto:2.14
        Case "/BODA"

            If MapData(188, 49, 47).Userindex > 0 And MapData(188, 50, 47).Userindex > 0 Then
                Dim boda1 As Integer
                Dim boda2 As Integer
                boda1 = MapData(188, 49, 47).Userindex
                boda2 = MapData(188, 50, 47).Userindex

                If ((UserList(boda1).Madre = UserList(boda2).Madre) And UserList(boda1).Madre <> "") Or (UserList(boda1).Genero = UserList(boda2).Genero) Or UserList(boda1).Esposa > "" Or UserList(boda2).Esposa > "" Or UserList(boda1).Bebe > 0 Or UserList(boda2).Bebe > 0 Then Exit Sub

                'pluto:6.0A comprueba anillos y los quita
                If Not TieneObjetos(990, 1, boda1) Or Not TieneObjetos(990, 1, boda2) Then
                    Call SendData(ToIndex, Userindex, 0, "||Os faltan los Anillos de Boda." & "´" & FontTypeNames.FONTTYPE_talk)
                    Exit Sub

                End If

                'pluto:6.2---------------
                If UserList(boda1).Invent.AnilloEqpObjIndex > 0 Or UserList(boda2).Invent.AnilloEqpObjIndex > 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||Los Anillos deben estar desequipados." & "´" & FontTypeNames.FONTTYPE_talk)
                    Exit Sub

                End If

                '-------------------------
                Call QuitarObjetos(990, 1, boda1)
                Call QuitarObjetos(990, 1, boda2)
                '---------------
                UserList(boda1).Esposa = UserList(boda2).Name
                UserList(boda2).Esposa = UserList(boda1).Name
                Call SendData(ToAll, 0, 0, "||Felicidades a " & UserList(boda1).Name & " y " & UserList(boda2).Name & " que acaban de celebrar su Boda." & "´" & FontTypeNames.FONTTYPE_talk)
                Call SendData2(ToPCArea, boda1, UserList(boda1).Pos.Map, 22, UserList(boda1).Char.CharIndex & "," & 88 & "," & 35)
                Call SendData2(ToPCArea, boda2, UserList(boda2).Pos.Map, 22, UserList(boda2).Char.CharIndex & "," & 88 & "," & 35)
                Call SendData(ToMap, boda1, UserList(boda1).Pos.Map, "TM" & 25)
                'pluto:6.0A
            Else
                Call SendData(ToIndex, Userindex, 0, "||Situaros los dos justo delante del Altar." & "´" & FontTypeNames.FONTTYPE_talk)

            End If

            Exit Sub

            'pluto:2.17
        Case "/DIVORCIO"

            If UserList(Userindex).Esposa = "" Then Exit Sub
            'Dim Tindex As Integer
            Tindex = NameIndex(UserList(Userindex).Esposa & "$")

            'esta online
            If Tindex > 0 Then
                UserList(Tindex).Esposa = ""
                UserList(Tindex).Amor = 0
                Call SendData(ToIndex, Tindex, 0, "||Tu Pareja se ha divorciado." & "´" & FontTypeNames.FONTTYPE_talk)
            Else    ' no esta online
                'Dim userfile As String
                UserFile = CharPath & Left$(UserList(Userindex).Esposa, 1) & "\" & UCase$(UserList(Userindex).Esposa) & ".chr"
                Call WriteVar(UserFile, "INIT", "Esposa", "")
                Call WriteVar(UserFile, "INIT", "Amor", 0)

            End If

            UserList(Userindex).Esposa = ""
            UserList(Userindex).Amor = 0
            Call SendData(ToIndex, Userindex, 0, "||Te has Divorciado de tu Pareja." & "´" & FontTypeNames.FONTTYPE_talk)
            Exit Sub

            'pluto:7.0
        Case "/CIUDAD"

            If UserList(Userindex).raza <> "Vampiro" Then Exit Sub

            If UserList(Userindex).Counters.Pena > 0 Or UserList(Userindex).Pos.Map = 191 Then Exit Sub

            If UserList(Userindex).flags.Paralizado > 0 Then
                Call SendData(ToIndex, Userindex, 0, "L99")
                Call SendData(ToIndex, Userindex, 0, "||No puedes estando paralizado!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            If UserList(Userindex).Char.Body <> 9 And UserList(Userindex).Char.Body <> 260 Then
                Call SendData(ToIndex, Userindex, 0, "||Debes estar Transformado para la Teleportación!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            Dim C As Byte
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
                va1 = 170
                va2 = 34
                va3 = 34 + C

            End If

            Call WarpUserChar(Userindex, va1, va2, va3, True)
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 100 & "," & 1)
            'Sonido
            SendData ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_tele
            'solo una vez por transformación.
            UserList(Userindex).Counters.Morph = 0
            UserList(Userindex).Stats.MinSta = 0
            Exit Sub

            'pluto:2.8.0
        Case "/VAMPIRO"
            'pluto:2.11
            Dim abody As Integer

            If UserList(Userindex).flags.Morph > 0 Or UserList(Userindex).flags.Muerto > 0 Or UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Demonio > 0 Then Exit Sub

            If UCase$(UserList(Userindex).raza) = "VAMPIRO" Then
                UserList(Userindex).Counters.Morph = IntervaloMorphPJ
                UserList(Userindex).flags.Morph = UserList(Userindex).Char.Body

                If UserList(Userindex).Stats.ELV < 40 Then abody = 9 Else abody = 260
                Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, val(abody), val(0), UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & Hechizos(42).FXgrh & "," & Hechizos(25).loops)
                Exit Sub

            End If

            'pluto:7.0 berserker
            'EZE BERSERKER
            If UCase$(UserList(Userindex).raza) = "ENANO" Then

                If UserList(Userindex).flags.Montura > 0 Then Exit Sub

                If UserList(Userindex).flags.Navegando = 1 Then Exit Sub
                UserList(Userindex).Counters.Morph = IntervaloMorphPJ
                UserList(Userindex).flags.Morph = UserList(Userindex).Char.Body
                Call SendData(ToIndex, Userindex, 0, "||¡¡¡¡¡¡¡ HAS ENTRADO EN BERSERKER !!!!!!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            Exit Sub

            'EZE BERSERKER
            'pluto:6.0A
        Case "/MINOTAURO"

            If UserList(Userindex).flags.Morph > 0 Or UserList(Userindex).flags.Muerto > 0 Or UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Demonio > 0 Then Exit Sub

            If UserList(Userindex).flags.Minotauro = 0 Then Exit Sub
            UserList(Userindex).Counters.Morph = IntervaloMorphPJ
            UserList(Userindex).flags.Morph = UserList(Userindex).Char.Body
            Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, 380, val(0), UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & Hechizos(43).FXgrh & "," & Hechizos(25).loops)
            Exit Sub

            'pluto:6.9
        Case "/HIPOPOTAMO"

            If UserList(Userindex).flags.Montura <> 1 Then Exit Sub

            If UserList(Userindex).flags.DragCredito6 = 3 Then
                Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, 365, UserList(Userindex).Char.Head, UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & Hechizos(43).FXgrh & "," & Hechizos(25).loops)
                Exit Sub

            End If

            'pluto:6.9
        Case "/PANTERA"

            If UserList(Userindex).flags.Montura <> 1 Then Exit Sub

            If UserList(Userindex).flags.DragCredito6 = 1 Then
                Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, 350, UserList(Userindex).Char.Head, UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & Hechizos(43).FXgrh & "," & Hechizos(25).loops)
                Exit Sub

            End If

            'pluto:6.9
        Case "/CIERVO"

            If UserList(Userindex).flags.Montura <> 1 Then Exit Sub

            If UserList(Userindex).flags.DragCredito6 = 2 Then
                Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, 344, UserList(Userindex).Char.Head, UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & Hechizos(43).FXgrh & "," & Hechizos(25).loops)
                Exit Sub

            End If

        Case "/MUERTES"
            Call SendUserMuertes(Userindex, Userindex)
            Exit Sub

        Case "/CONSTRUIR"
            Call SendData(ToIndex, Userindex, 0, "ZZ")
            Exit Sub

            'pluto:2.3
        Case "/MONTURA"
            'Call EnviarMontura(UserIndex)
            Exit Sub

        Case "/CRAFTEAR"

            With UserList(Userindex)

                '¿Esta el user muerto? Si es asi no puede comerciar
                If .flags.Muerto = 1 Then
                    Call SendData(ToIndex, Userindex, 0, "L3")
                    Exit Sub

                End If

                '¿El target es un NPC valido?
                If .flags.TargetNpc > 0 Then

                    '¿El NPC puede Craftear?
                    If Npclist(.flags.TargetNpc).NPCtype = NPCTYPE_CRAFTER Then

                        'If Len(Npclist(.flags.TargetNpc).Desc) > 0 Then
                         '   Call SendData(ToPCArea, Userindex, .Pos.Map, "||6°No tengo ningun interes en comerciar.°" & CStr(Npclist(.flags.TargetNpc).Char.CharIndex))
                          '  Exit Sub

                        'End If

                        If Distancia(Npclist(.flags.TargetNpc).Pos, .Pos) > 3 Then
                            Call SendData(ToIndex, Userindex, 0, "L2")
                            Exit Sub

                        End If

                        Call SendData2(ToIndex, Userindex, 0, 118)

                    End If

                End If

            End With

            Exit Sub

        Case "/COMERCIAR"

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            If UserList(Userindex).flags.TargetUser > 0 Then

                'pluto:6.9
                If UserList(Userindex).Pos.Map = 171 Or UserList(Userindex).Pos.Map = 177 Or MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEO" Then Exit Sub

                If MapInfo(UserList(Userindex).Pos.Map).Terreno = "EVENTO" Then Exit Sub

                If MapInfo(UserList(Userindex).Pos.Map).Terreno = "TORNEOGM" Then Exit Sub

                'Comercio con otro usuario
                'Puede comerciar ?
                If UserList(UserList(Userindex).flags.TargetUser).flags.Muerto = 1 Then
                    Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes comerciar con los muertos!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                    Exit Sub

                End If

                'soy yo ?
                If UserList(Userindex).flags.TargetUser = Userindex Then
                    Call SendData(ToIndex, Userindex, 0, "||No puedes comerciar contigo mismo..." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                    Exit Sub

                End If

                'pluto:2.9.0
                If UserList(Userindex).flags.Privilegios > 0 Or UserList(UserList(Userindex).flags.TargetUser).flags.Privilegios > 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||No puedes comerciar con el GM" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                    Exit Sub

                End If

                'ta muy lejos ?
                If Distancia(UserList(UserList(Userindex).flags.TargetUser).Pos, UserList(Userindex).Pos) > 3 Then
                    Call SendData(ToIndex, Userindex, 0, "G9")
                    Exit Sub

                End If

                'Ya ta comerciando ? es con migo o con otro ?
                If UserList(UserList(Userindex).flags.TargetUser).flags.Comerciando = True And UserList(UserList(Userindex).flags.TargetUser).ComUsu.DestUsu <> Userindex Then
                    Call SendData(ToIndex, Userindex, 0, "||No puedes comerciar con el usuario en este momento." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                    Exit Sub

                End If

                'pluto:2.7.0
                'maximo inventario
                Dim ii As Byte
                'pluto:2.9.0
                Dim i1 As Byte
                Dim i2 As Byte
                i1 = 0
                i2 = 0

                For ii = 1 To MAX_INVENTORY_SLOTS

                    If UserList(Userindex).Invent.Object(ii).ObjIndex = 0 Then i1 = i1 + 1

                    If i1 > 3 Then GoTo u1
                Next ii

                Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes comerciar tienes el inventario muy lleno!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                Exit Sub
u1:

                For ii = 1 To MAX_INVENTORY_SLOTS

                    If UserList(UserList(Userindex).flags.TargetUser).Invent.Object(ii).ObjIndex = 0 Then i2 = i2 + 1
                Next ii

                If i2 > 3 Then GoTo u2
                Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes comerciar porque el tiene su inventario muy lleno!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                Exit Sub
u2:

                If UserList(Userindex).flags.Montura > 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||¡¡No uses la mascota mientras comercias!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                    Exit Sub

                End If

                If UserList(Userindex).flags.Navegando > 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||¡¡No comercies mientras navegas!!" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
                    Exit Sub

                End If

                '---------------------------------------
                'inicializa unas variables...
                UserList(Userindex).ComUsu.DestUsu = UserList(Userindex).flags.TargetUser
                UserList(Userindex).ComUsu.Cant = 0
                UserList(Userindex).ComUsu.Objeto = 0
                UserList(Userindex).ComUsu.Acepto = False
                'Rutina para comerciar con otro usuario
                Call IniciarComercioConUsuario(Userindex, UserList(Userindex).flags.TargetUser)
            Else
                Call SendData(ToIndex, Userindex, 0, "L4")

            End If

            Exit Sub

            '[/Alejo]
        'Case "/ENLISTAR"

            'Se asegura que el target es un npc
         '   If UserList(Userindex).flags.TargetNpc = 0 Then
          '      Call SendData(ToIndex, Userindex, 0, "L4")
           '     Exit Sub

            'End If

            'If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 5 Or UserList(Userindex).flags.Muerto <> 0 Then Exit Sub

            'If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 4 Then
             '   Call SendData(ToIndex, Userindex, 0, "L2")
              '  Exit Sub

            'End If

            'If Npclist(UserList(Userindex).flags.TargetNpc).flags.Faccion = 0 Then
             '   Call EnlistarArmadaReal(Userindex)

            'End If

            'If Npclist(UserList(Userindex).flags.TargetNpc).flags.Faccion = 1 Then
             '   Call EnlistarCaos(Userindex)

            'End If

            'enlistar legion
            'If Npclist(UserList(Userindex).flags.TargetNpc).flags.Faccion = 2 Then

                'pluto:2.15 Fuera legión
                'Call Enlistarlegion(UserIndex)
            'End If

            'Exit Sub

        Case "/INFORMACION"

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 5 Or UserList(Userindex).flags.Muerto <> 0 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 4 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).flags.Faccion = 0 Then

                If UserList(Userindex).Faccion.ArmadaReal = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°No perteneces a las tropas reales!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                    Exit Sub

                End If

                Call SendData(ToIndex, Userindex, 0, "||6°Tu deber es combatir criminales, cada 100 criminales que derrotes te dare una recompensa.°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
            Else

                If UserList(Userindex).Faccion.FuerzasCaos = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°No perteneces a las fuerzas del caos!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                    Exit Sub

                End If

                Call SendData(ToIndex, Userindex, 0, "||6°Tu deber es sembrar el caos y la desesperanza, cada 100 ciudadanos que derrotes te dare una recompensa.°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

            End If

            Exit Sub

            'pluto:2.24
        Case "/GRIAL"

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 28 Or UserList(Userindex).flags.Muerto <> 0 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 4 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Not TieneObjetos(157, 3, Userindex) Then
                Call SendData(ToIndex, Userindex, 0, "||6°No tienes las 3 Copas Griales!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                Exit Sub

            End If

            Call QuitarObjetos(157, 3, Userindex)
            Call CambiarGriaL(Userindex)
            Exit Sub

        Case "/CABALLERO"

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 120 Or UserList(Userindex).flags.Muerto <> 0 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 4 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Not TieneObjetos(1241, 5, Userindex) Then
                Call SendData(ToIndex, Userindex, 0, "||6°No tienes las 5 Bolas de Cristal!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                Exit Sub

            End If

            Call QuitarObjetos(1241, 5, Userindex)
            Call CambiarBola(Userindex)
            Exit Sub

            'IRON AO: Sistema Regresar
        Case "/REGRESAR"

            If UserList(Userindex).Pos.Map = 66 Then    'REMPLAZEN EL 66 POR EL NUM DE MAP DE LA CARCEL DE SU SV
                Call SendData(ToIndex, Userindex, 0, "||No escaparás de la carcel." & "´" & FontTypeNames.FONTTYPE_INFO)    ' Juance!
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 190 Then    'REMPLAZEN EL MAPA POR EL QUE QUIERAN
                Call SendData(ToIndex, Userindex, 0, "||No podés abandonar este mapa, si deseas regresar, pidele a un GM via /SOPORTE" & "´" & FontTypeNames.FONTTYPE_INFO)    ' Juance!
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 194 Then    'REMPLAZEN EL MAPA POR EL QUE QUIERAN
                Call SendData(ToIndex, Userindex, 0, "||No puedes abandonar el duelo, si quieres salir tipea /SALIRDUELO" & "´" & FontTypeNames.FONTTYPE_INFO)    ' Juance!
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 205 Then    'REMPLAZEN EL MAPA POR EL QUE QUIERAN
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir del CvC" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).flags.Guerra = True Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes salir estando en guerra." & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            If UserList(Userindex).Pos.Map = 191 Then    'REMPLAZEN EL MAPA POR EL QUE QUIERAN
                Call SendData(ToIndex, Userindex, 0, "||No podés abandonar este mapa, si deseas regresar, pidele a un GM via /SOPORTE" & "´" & FontTypeNames.FONTTYPE_INFO)    ' Juance!
                Exit Sub

            End If

            If UserList(Userindex).flags.Muerto = 0 Then    'SI EL USER ESTA VIVO, NO PUEDE REGRESAR.
                Call SendData(ToIndex, Userindex, 0, "||No podés volver a la ciudad si estas vivo!" & "´" & FontTypeNames.FONTTYPE_INFO)    ' Juance!
                Exit Sub

            End If

            If UserList(Userindex).Pos.Map = 34 Then    'Si el user esta en ulla, no lo deja regresar, podria laguear el sv con eso
                Call SendData(ToIndex, Userindex, 0, "||Ya estas en nix!" & "´" & FontTypeNames.FONTTYPE_INFO)    'Juance!
                Exit Sub

            End If

            Call WarpUserChar(Userindex, 34, 50, 50, True)
            Exit Sub

        Case "/TROFEO"

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 130 Or UserList(Userindex).flags.Muerto <> 0 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 4 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Not TieneObjetos(1245, 3, Userindex) Then
                Call SendData(ToIndex, Userindex, 0, "||6°No tienes las 3 Trofeos de Primer Puesto!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                Exit Sub

            End If

            Call QuitarObjetos(1245, 3, Userindex)
            Call CambiarTrofeo(Userindex)
            Exit Sub

        Case "/TROFEO2"

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 140 Or UserList(Userindex).flags.Muerto <> 0 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 4 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Not TieneObjetos(1246, 3, Userindex) Then
                Call SendData(ToIndex, Userindex, 0, "||6°No tienes las 3 Trofeos de Segundo Puesto!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                Exit Sub

            End If

            Call QuitarObjetos(1246, 3, Userindex)
            Call CambiarTrofeo(Userindex)
            Exit Sub

            'pluto:2.3
        Case "/DRAGON"

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 18 Or UserList(Userindex).flags.Muerto <> 0 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 4 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            Dim ge As Integer

            For ge = 406 To 413

                If Not TieneObjetos(ge, 1, Userindex) Then
                    Call SendData(ToIndex, Userindex, 0, "||6°No tienes todas las Gemas!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                    Exit Sub

                End If

            Next ge

            If Not TieneObjetos(598, 1, Userindex) Then
                Call SendData(ToIndex, Userindex, 0, "||6°No tienes todas las Gemas!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                Exit Sub

            End If

            For ge = 406 To 413
                Call QuitarObjetos(ge, 1, Userindex)
            Next ge

            Call QuitarObjetos(598, 1, Userindex)
            Call CambiarGemas(Userindex)
            Exit Sub

        Case "/RECOMPENSA"

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 5 Or UserList(Userindex).flags.Muerto <> 0 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 4 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).flags.Faccion = 0 Then

                If UserList(Userindex).Faccion.ArmadaReal <> 1 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°No perteneces a las tropas reales!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                    Exit Sub

                End If

                Call RecompensaArmadaReal(Userindex)

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).flags.Faccion = 1 Then

                If UserList(Userindex).Faccion.FuerzasCaos = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°No perteneces a las fuerzas del caos!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                    Exit Sub

                End If

                Call RecompensaCaos(Userindex)

            End If

            'recompensa legion
            If Npclist(UserList(Userindex).flags.TargetNpc).flags.Faccion = 2 Then

                If UserList(Userindex).Faccion.ArmadaReal <> 2 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°No perteneces a las tropas de la Legión!!!°" & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
                    Exit Sub

                End If

                Call Recompensalegion(Userindex)

            End If

            Exit Sub

        Case "/ROSTRO"

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_CIRUJANO Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            Dim u As Integer

            If UserList(Userindex).Genero = "Hombre" Then

                Select Case (UserList(Userindex).raza)

                    Case "Humano"
                        u = CInt(RandomNumber(3, 49))

                        If u = 27 Then u = 28

                    Case "Abisario"
                        u = CInt(RandomNumber(1, 4)) + 800

                        If u > 804 Then u = 804

                    Case "Elfo"
                        u = CInt(RandomNumber(1, 19)) + 100

                        If u > 119 Then u = 119

                    Case "Elfo Oscuro"
                        u = CInt(RandomNumber(1, 16)) + 200

                        If u > 216 Then u = 216

                    Case "Enano"
                        u = RandomNumber(1, 11) + 300

                        If u > 311 Then u = 311

                        'pluto:7.0
                    Case "Goblin"
                        u = RandomNumber(1, 8) + 704

                        If u > 712 Then u = 712

                    Case "Gnomo"
                        u = RandomNumber(1, 10) + 400

                        If u > 410 Then u = 410

                    Case "Orco"
                        u = CInt(RandomNumber(1, 6)) + 600

                        If u > 606 Then u = 606

                    Case "Vampiro"
                        u = CInt(RandomNumber(1, 8)) + 504

                        If u > 512 Then u = 512
                        
                    Case "Tauros"
                        u = CInt(RandomNumber(1, 4)) + 919

                        If u > 923 Then u = 923
                        
                    Case "Licantropos"
                        u = CInt(RandomNumber(1, 4)) + 899

                        If u > 903 Then u = 903
                        
                    Case "NoMuerto"
                        u = CInt(RandomNumber(1, 4)) + 859

                        If u > 863 Then u = 863

                    Case Else
                        u = 1

                End Select

            End If

            'mujer
            If UserList(Userindex).Genero = "Mujer" Then

                Select Case (UserList(Userindex).raza)

                    Case "Humano"
                        u = CInt(RandomNumber(1, 13)) + 69

                        If u > 82 Then u = 82

                    Case "Abisario"
                        u = CInt(RandomNumber(1, 3)) + 850

                        If u > 853 Then u = 853

                    Case "Elfo"
                        u = CInt(RandomNumber(1, 11)) + 169

                        If u > 180 Then u = 180

                    Case "Elfo Oscuro"
                        u = CInt(RandomNumber(1, 8)) + 269

                        If u > 277 Then u = 277

                    Case "Goblin"
                        u = RandomNumber(1, 4) + 700

                        If u > 704 Then u = 704

                    Case "Gnomo"
                        u = RandomNumber(1, 6) + 469

                        If u > 475 Then u = 475

                    Case "Enano"
                        u = RandomNumber(1, 3) + 369

                        If u > 472 Then u = 472

                    Case "Orco"
                        u = RandomNumber(1, 3) + 606

                        If u > 609 Then u = 609

                    Case "Vampiro"
                        u = RandomNumber(1, 3) + 500

                        If u > 503 Then u = 503
                        
                    Case "Tauros"
                        u = CInt(RandomNumber(1, 4)) + 909

                        If u > 913 Then u = 913
                        
                    Case "Licantropos"
                        u = CInt(RandomNumber(1, 4)) + 889

                        If u > 893 Then u = 893
                        
                    Case "NoMuerto"
                        u = CInt(RandomNumber(1, 4)) + 879

                        If u > 883 Then u = 883

                    Case Else
                        u = 70

                End Select

            End If

            If UserList(Userindex).Char.Head = u Then
                Call SendData(ToIndex, Userindex, 0, "||6°No puedo operar ahora, vuelva más tarde.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                Exit Sub

            End If

            If UserList(Userindex).Stats.GLD > 999 Then
                UserList(Userindex).Char.Head = u
                UserList(Userindex).OrigChar.Head = u
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - 1000
                Call SendData(ToIndex, Userindex, 0, "||" & vbWhite & "°" & "Tu rostro ha sido operado por 1000 oros." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex & "´" & FontTypeNames.FONTTYPE_INFO)
                '[gau]
                Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Char.Body, val(u), UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
            Else
                Call SendData(ToIndex, Userindex, 0, "||6°No tenes esa cantidad.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)

            End If

            Call SendUserStatsOro(val(Userindex))
            Exit Sub

        Case "/TORNEO"
            Dim r10
            Dim y10
            r10 = RandomNumber(52, 71)
            y10 = RandomNumber(44, 59)

            '¿Esta el user muerto? Si es asi no puede comerciar
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'pluto:6.0A
            If UserList(Userindex).flags.Morph > 0 Or UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Demonio > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡No puedes entrar transformado a Torneo.!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If UserList(Userindex).flags.Montura > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||No se permiten Mascotas" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 7)

            'pluto:6.2
            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_TORNEO And Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 22 And Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> 41 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            'controla la entrada al torneo
            If UserList(Userindex).NroMacotas > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||6°No puedes llevar mascotas al torneo.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                Exit Sub

            End If

            If UserList(Userindex).flags.Invisible > 0 Then
                Call SendData(ToIndex, Userindex, 0, "||6°No puedes ir invisible al torneo.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                Exit Sub

            End If

            'pluto:6.2 torneo 1v1
            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = NPCTYPE_TORNEO Then

                If MapInfo(mapatorneo).NumUsers > 1 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°El mapa de torneo está ocupado ahora mismo.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub
                Else

                    If MapInfo(mapatorneo).NumUsers = 0 Then
                        Call SendData(ToMap, 0, 34, "||Torneo 1vs1: " & UserList(Userindex).Name & " espera rival en la Sala De Torneos." & "´" & FontTypeNames.FONTTYPE_talk)

                    End If

                    If MapInfo(mapatorneo).NumUsers > 0 Then
                        Call SendData(ToMap, 0, 34, "||Torneo 1vs1: " & UserList(Userindex).Name & " acepto el desafio!!!" & "´" & FontTypeNames.FONTTYPE_talk)

                    End If

                End If

                Call WarpUserChar(Userindex, mapatorneo, r10, y10, True)
                'torneo bote
            ElseIf Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = 22 Then    'npctorneo bote

                If MapInfo(MapaTorneo2).NumUsers > 3 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°El mapa de torneo está a tope ahora mismo.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                End If

                If UserList(Userindex).Stats.ELV > 30 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°Tienes demasiado nivel.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                End If

                If UserList(Userindex).Stats.GLD < 100 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°No tienes suficiente Oro.°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                End If

                'manda al mapa de torneo
                Call WarpUserChar(Userindex, MapaTorneo2, r10, y10, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - 100
                Call SendUserStatsOro(Userindex)
                'torneo todosvstodos
            ElseIf Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = 41 Then
                Call WarpUserChar(Userindex, 293, r10, y10, True)
                'torneo clanes
            ElseIf Npclist(UserList(Userindex).flags.TargetNpc).NPCtype = 42 Then
                'pluto.6.8
                Exit Sub    'desactivado

                'si hay dos clanes dentro comprobamos que el user es de uno de ellos
                'TClanOcupado = 0
                If UserList(Userindex).GuildInfo.GuildName = "" Then Exit Sub

                'pluto:6.3
                If UserList(Userindex).flags.Privilegios > 0 Then Exit Sub

                If TClanOcupado = 2 Then

                    If UserList(Userindex).GuildInfo.GuildName <> TorneoClan(1).Nombre And UserList(Userindex).GuildInfo.GuildName <> TorneoClan(2).Nombre Then
                        Call SendData(ToIndex, Userindex, 0, "||5°" & "Mapa ocupado: " & TorneoClan(1).Nombre & " vs " & TorneoClan(2).Nombre & "°" & Npclist(TempCharIndex).Char.CharIndex)
                        Exit Sub
                    Else    'si es uno de los clanes que estan dentor sumamos

                        If UserList(Userindex).GuildInfo.GuildName = TorneoClan(1).Nombre Then
                            TorneoClan(1).numero = TorneoClan(1).numero + 1
                            Call WarpUserChar(Userindex, 292, r10, y10, True)
                        ElseIf UserList(Userindex).GuildInfo.GuildName = TorneoClan(2).Nombre Then
                            TorneoClan(2).numero = TorneoClan(2).numero + 1
                            Call WarpUserChar(Userindex, 292, r10, y10, True)

                        End If

                    End If

                Else    ' si hay hueco para clan nuevo
                    TClanOcupado = TClanOcupado + 1

                    'si el clan 1 es el nuevo..
                    If TorneoClan(1).numero = 0 Then
                        TorneoClan(1).Nombre = UserList(Userindex).GuildInfo.GuildName
                        TorneoClan(1).numero = TorneoClan(1).numero + 1
                        Call WarpUserChar(Userindex, 292, r10, y10, True)
                    Else    ' si lo es el clan 2..
                        TorneoClan(2).Nombre = UserList(Userindex).GuildInfo.GuildName
                        TorneoClan(2).numero = TorneoClan(2).numero + 1
                        Call WarpUserChar(Userindex, 292, r10, y10, True)

                    End If

                End If

            End If    'npctype torneo
            Exit Sub

        Case "/DDD"

            'TorneoPluto.FaseTorneo = 0
            If UserList(Userindex).flags.TorneoPluto = 1 Then
                UserList(Userindex).flags.TorneoPluto = 0
                Exit Sub

            End If

            UserList(Userindex).flags.TorneoPluto = 1

            If TorneoPluto.FaseTorneo = 0 Then Call SendData2(ToIndex, Userindex, 0, 90)

            If TorneoPluto.FaseTorneo = 1 Then Call EnviarTorneo(Userindex)
            Exit Sub

        Case "/CHISME"    'chisme

            '¿Esta el user muerto? Si es asi no puede pedir un chisme
            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            'Se asegura que el target es un npc
            If UserList(Userindex).flags.TargetNpc = 0 Then
                Call SendData(ToIndex, Userindex, 0, "L4")
                Exit Sub

            End If

            If Distancia(Npclist(UserList(Userindex).flags.TargetNpc).Pos, UserList(Userindex).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            rdata = Right$(rdata, Len(rdata) - 7)

            If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_CHISMOSO Or UserList(Userindex).flags.Muerto = 1 Then Exit Sub

            If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                Exit Sub

            End If

            ' tiene mil oros para pagar por el chisme?
            If UserList(Userindex).Stats.GLD > 999 Then
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - 5000
                'pluto:2.14
                SendUserStatsOro (Userindex)
            Else
                Call SendData(ToIndex, Userindex, 0, "||6°Por menos de 5000 oros no abro la boca...°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                Exit Sub

            End If

            ReDim AtributosNames(1 To NUMATRIBUTOS) As String
            AtributosNames(1) = "Fuerza"
            AtributosNames(2) = "Agilidad"
            AtributosNames(3) = "Inteligencia"
            AtributosNames(4) = "Carisma"
            AtributosNames(5) = "Constitucion"
            ' aqui se supone que elige usuario con una etiqueta para hacer alguna llamada
eligepjnogm:
            Dim eligepj As Integer
            eligepj = RandomNumber(1, LastUser)

            ' que no sea un GM... contar chismes de gm no tiene sentido
            'pluto:6.0A
            If UserList(eligepj).flags.UserLogged = False Then GoTo eligepjnogm

            If UserList(eligepj).flags.Privilegios <> 0 Then GoTo eligepjnogm
            ' si es newbie tampoco... pagar para tener chismes de newbies, mejor no
            'If UserList(eligepj).Stats.ELV <= LimiteNewbie Then GoTo eligepjnogm
            ' aqui elige 2 skills aleatorios para su posible uso (es trabajo extra a la cpu si luego no se usa ese chisme...podría ponerse justo en el case...)
eligeskill:
            Dim eligeskill1 As Integer
            Dim eligeskill2 As Integer
            eligeskill1 = RandomNumber(1, NUMSKILLS)
            ' si es wrestiling o supervivencia ponemos el siguiente :P (que chapuza, navegacion y talar, saldrán mas... :PPP)
            'If eligeskill1 = 9 Or eligeskill1 = 20 Then eligeskill1 = eligeskill1 + 1
eligeskilldistinto:
            eligeskill2 = RandomNumber(1, NUMSKILLS)

            If eligeskill2 = 9 Or eligeskill2 = 20 Then eligeskill2 = eligeskill2 + 1

            ' si son iguales los dos skills elegimos otro segundo skill
            If eligeskill1 = eligeskill2 Then GoTo eligeskilldistinto
            ' aquí elige 2 atributos aleatorios... igual ke los skill, puede ser trabajo extra :PP
eligeatrib:
            Dim eligeatrib1 As Integer
            Dim eligeatrib2 As Integer
            eligeatrib1 = RandomNumber(1, 5)

            ' si es carisma elige mmm, constitucion que es interesante para todos...(no kiero poner un goto hacia atras)
            If eligeatrib1 = 4 Then eligeatrib1 = 5
eligeatribdistinto:
            eligeatrib2 = RandomNumber(1, 5)

            If eligeatrib2 = 4 Then GoTo eligeatribdistinto

            ' si son iguales los dos atrib elegimos otro segundo (pluto se moskeará cuando vea dos gotos para atrás casi juntos... :PP)
            If eligeatrib1 = eligeatrib2 Then GoTo eligeatribdistinto
            res = RandomNumber(1, 1000)

            ' aqui selecciona el tipo de mensaje en función del resultado aleatorio
            Select Case res

                Case Is > 950
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°Las malas lenguas dicen que " & UserList(eligepj).Name & " tiene " & UserList(eligepj).Stats.UserAtributos(1) & " de fuerza, " & UserList(eligepj).Stats.UserAtributos(2) & " de agilidad, " & UserList(eligepj).Stats.UserAtributos(3) & " de inteligencia y " & UserList(eligepj).Stats.UserAtributos(5) & " de constitución...vaya birria, no? :PP" & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case 861 To 950
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°Me han contado que " & UserList(eligepj).Name & " sólo ha matado " & UserList(eligepj).Stats.NPCsMuertos & " monstruos, porque se lo comen vivo al tener la poquita vida de " & UserList(eligepj).Stats.MaxHP & " no me extraña...pobrecito..." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case 781 To 860
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°¿Pero tu no sabías que " & UserList(eligepj).Name & " es " & UserList(eligepj).clase & "?..., pero si lo sabe hasta el mas new de AODrag..." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case 691 To 780
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°...como te iba diciendo, han visto a " & UserList(eligepj).Name & " por el mapa " & UserList(eligepj).Pos.Map & "... y digo yo que qué hará por ahí... seguro que nada bueno°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case 601 To 690

                    If UserList(eligepj).Stats.GLD < 100000 Then
                        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°Pobre " & UserList(eligepj).Name & ", como le asalten le robarán las " & UserList(eligepj).Stats.GLD & " monedas que con tanto sudor ganó..." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Else
                        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°" & UserList(eligepj).Name & " se que lleva " & UserList(eligepj).Stats.GLD & " monedas encima... esa cantidad sólo se consigue haciendo maldades...¡si lo sabré yo que le conozco bien!" & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)

                    End If

                    Exit Sub

                Case 511 To 600
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°Sé de buena tinta que " & UserList(eligepj).Name & " con su level " & UserList(eligepj).Stats.ELV & " solo tiene " & UserList(eligepj).Stats.UserSkills(2) & " de magia y " & UserList(eligepj).Stats.MaxMAN & " de maná... con eso tardará dias en matar un lobo" & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case 371 To 510
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°Me he enterado de que " & UserList(eligepj).Name & " tiene " & UserList(eligepj).Stats.UserSkills(eligeskill1) & " de " & SkillsNames(eligeskill1) & ", " & UserList(eligepj).Stats.UserSkills(eligeskill2) & " de " & SkillsNames(eligeskill2) & " y pega por " & UserList(eligepj).Stats.MaxHIT & " de cuando en cuando..." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case 231 To 370
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°Sí... el " & UserList(eligepj).raza & " al que llaman " & UserList(eligepj).Name & ", dicen que su madre es una araña y su padre un zombie, y por eso tiene " & UserList(eligepj).Stats.UserAtributos(eligeatrib1) & " de " & AtributosNames(eligeatrib1) & ", y " & UserList(eligepj).Stats.UserAtributos(eligeatrib2) & " de " & AtributosNames(eligeatrib2) & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case 141 To 230
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°Sí... el " & UserList(eligepj).raza & " al que llaman " & UserList(eligepj).Name & ", dicen que su madre es una araña y su padre un zombie, y por eso tiene " & UserList(eligepj).Stats.UserAtributos(eligeatrib1) & " de " & AtributosNames(eligeatrib1) & ", y " & UserList(eligepj).Stats.UserAtributos(eligeatrib2) & " de " & AtributosNames(eligeatrib2) & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case 51 To 140
                    'pluto:2.14 bug ciudas matados
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°" & UserList(eligepj).Name & " ha matado " & UserList(eligepj).Faccion.CriminalesMatados & " Hordas y " & UserList(eligepj).Faccion.CiudadanosMatados & " Alianzas... habrá que ponerle una estatua por eso?" & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Exit Sub

                Case Is < 51
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||6°A mi me llaman chismosa, pero que sepan todos que tú eres cien veces más cotilla que yo..." & "°" & Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex)
                    Call SendData(ToAll, 0, 0, "||NOTICIA DE AODRAG: a " & UserList(Userindex).Name & " le encantan los chismes y es cotilla de nacimiento!!!!!" & "´" & FontTypeNames.FONTTYPE_GUILD)
                    Exit Sub

            End Select

    End Select

    Call TCP4(Userindex, rdata)
    Exit Sub
ErrorComandoPj:
    Call LogError("TCP2. CadOri:" & CadenaOriginal & " Nom:" & UserList(Userindex).Name & "UI:" & Userindex & " N: " & Err.number & " D: " & Err.Description)
    Call CloseSocket(Userindex)

End Sub

Sub TCP4(ByVal Userindex As Integer, ByVal rdata As String)


    On Error GoTo ErrorComando:

    Dim LC As Byte
    Dim tot As Integer
    Dim sndData As String
    Dim CadenaOriginal As String
    Dim Moverse As Byte
    Dim loopc As Integer
    Dim nPos As WorldPos
    Dim tStr As String
    Dim tInt As Integer
    Dim tLong As Long
    Dim Tindex As Integer
    Dim tName As String
    Dim tNome As String
    Dim tpru As String
    Dim tMessage As String
    Dim auxind As Integer
    Dim Arg1 As String
    Dim Arg2 As String
    Dim Arg3 As String
    Dim Arg4 As String
    Dim Ver As String
    Dim encpass As String
    Dim pass As String
    Dim Mapa As Integer
    Dim Name As String
    Dim ind
    Dim n As Integer
    Dim wpaux As WorldPos
    Dim mifile As Integer
    Dim X As Integer
    Dim Y As Integer
    Dim HayGM As Boolean
    Dim GM1 As String
    'pluto:6.0A
    CadenaOriginal = rdata

    If rdata = "" Then Exit Sub

    'pluto:2.10
    '¿Tiene un indece valido?
    If Userindex <= 0 Then
        Call CloseSocket(Userindex)
        Call LogError(Date & " Userindex no válido")
        Exit Sub

    End If

    '¿Está logeado?
    If UserList(Userindex).flags.UserLogged = False Then
        'Call LogError(Date & " We: " & UserList(UserIndex).ip & " / " & Cuentas(UserIndex).mail)
        'pluto:2.19 añade true
        Call CloseSocket(Userindex, True)
        Exit Sub

    End If

    'Sistema de Retos: EZE
    
    
'///////////////////////////// 2 vs 2////////////////////////////////
If UCase$(Left$(rdata, 6)) = "/DUAL " Then
    rdata = Right$(rdata, Len(rdata) - 6)
    Tindex = NameIndex(ReadField(1, rdata, 32))
    Arg1 = NameIndex(ReadField(2, rdata, 32))
    Arg2 = NameIndex(ReadField(3, rdata, 32))
    Arg3 = ReadField(4, rdata, 32)
    
    If Arg3 = NullArguments Then
    Call SendData(ToIndex, Userindex, 0, "||El comando para realizar duelos 2v2 es: /DUAL NICKCOMPAÑERO CONTRICANTE1 CONTRINCANTE2 ORO" & "´" & FONTTYPE_EJECUCION)
    Exit Sub
    End If
    
    If UserList(Userindex).flags.Montura = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes ingresar montado." & "´" & FontTypeNames.FONTTYPE_talk)
        Exit Sub
    End If
    
    '/////////////////// REVISO SI ESTA DISPONIBLE? ///////////////////////////
    If RetoDisponible = True Then
         Call SendData(ToIndex, Userindex, 0, "||La sala de Reto 2vs2 no esta disponible." & "´" & FONTTYPE_EJECUCION)
         Exit Sub
    End If
    
    '/////////////////// REVISO SI REPITO? ///////////////////////////
    If Userindex = Tindex Or Userindex = Arg1 Or Userindex = Arg2 Or Tindex = Arg1 Or Tindex = Arg2 Or Arg1 = Arg2 Then
         Call SendData(ToIndex, Userindex, 0, "||No se pueden entralazar las parejas." & "´" & FONTTYPE_EJECUCION)
         Exit Sub
    End If
    
    '/////////////////// REVISO SI ESTA ONLINE? ///////////////////////////
    If Tindex <= 0 Or Arg1 <= 0 Or Arg2 <= 0 Then
         Call SendData(ToIndex, Userindex, 0, "||Usuario offline" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
    End If
 
    '/////////////////// ALGUNO MUERTO? ///////////////////////////
    If UserList(Arg2).flags.Muerto = 1 Or UserList(Arg1).flags.Muerto = 1 Or UserList(Userindex).flags.Muerto = 1 Or UserList(Tindex).flags.Muerto = 1 Then  'tu estas muerto
         Call SendData(ToIndex, Userindex, 0, "||Los integrantes del reto deben estar vivos." & "´" & FONTTYPE_EJECUCION)
         Exit Sub
    End If
 
    '/////////////////// TODOS MAYOR A 25? ///////////////////////////
    If UserList(Userindex).Stats.ELV < 25 Or UserList(Tindex).Stats.ELV < 25 Or UserList(Arg1).Stats.ELV < 25 Or UserList(Arg2).Stats.ELV < 25 Then
        Call SendData(ToIndex, Userindex, 0, "||El nivel minimo para un reto es de 25." & "´" & FONTTYPE_EJECUCION)
        Exit Sub
    End If
    
    '/////////////////// MAYOR A 50k? ///////////////////////////
    If Arg3 < 1 Then
    Call SendData(ToIndex, Userindex, 0, "||La apuesta minima es de 1 Monedas de oro." & "´" & FONTTYPE_EJECUCION)
    Exit Sub
    End If
    
    '/////////////////// TODOS TIENEN EL ORO? ///////////////////////////
    If Arg3 > UserList(Userindex).Stats.GLD Or Arg3 > UserList(Tindex).Stats.GLD Or Arg3 > UserList(Arg1).Stats.GLD Or Arg3 > UserList(Arg2).Stats.GLD Then
        Call SendData(ToIndex, Userindex, 0, "||Los integrantes del Reto deben tener el oro suficiente." & "´" & FONTTYPE_EJECUCION)
        Exit Sub
    End If
    
    '/////////////////// ALGUNO FUERA DE ULLA? ///////////////////////////
    If Not UserList(Arg2).Pos.Map = 34 Or Not UserList(Arg1).Pos.Map = 34 Or Not UserList(Userindex).Pos.Map = 34 Or Not UserList(Tindex).Pos.Map = 34 Then
         Call SendData(ToIndex, Userindex, 0, "||Los integrantes del reto deben estar en Nix." & "´" & FONTTYPE_EJECUCION)
    
    Else
    
    RetoDoble.Jugador1 = Userindex
    RetoDoble.Jugador2 = Tindex
    RetoDoble.Jugador3 = Arg1
    RetoDoble.Jugador4 = Arg2
    RetoDoble.oro = Arg3
    
    Call SendData(ToIndex, RetoDoble.Jugador1, 0, "||Has enviado solicitud de reto." & "´" & FONTTYPE_GUILD)
    Call SendData(ToIndex, RetoDoble.Jugador2, 0, "||Te han invitado a un Reto: " & UserList(Userindex).Name & " (" & UserList(Userindex).Stats.ELV & ") y " & UserList(Tindex).Name & " (" & UserList(Tindex).Stats.ELV & ") Vs " & UserList(Arg1).Name & " (" & UserList(Arg1).Stats.ELV & ") y " & UserList(Arg2).Name & " (" & UserList(Arg2).Stats.ELV & ") .Apuesta: " & RetoDoble.oro & " Monedas de oro. Para aceptar escribe /RETO " & UserList(Userindex).Name & "." & "´" & FONTTYPE_EJECUCION)
    Call SendData(ToIndex, RetoDoble.Jugador3, 0, "||Te han invitado a un Reto: " & UserList(Userindex).Name & " (" & UserList(Userindex).Stats.ELV & ") y " & UserList(Tindex).Name & " (" & UserList(Tindex).Stats.ELV & ") Vs " & UserList(Arg1).Name & " (" & UserList(Arg1).Stats.ELV & ") y " & UserList(Arg2).Name & " (" & UserList(Arg2).Stats.ELV & ") .Apuesta: " & RetoDoble.oro & " Monedas de oro. Para aceptar escribe /RETO " & UserList(Userindex).Name & "." & "´" & FONTTYPE_EJECUCION)
    Call SendData(ToIndex, RetoDoble.Jugador4, 0, "||Te han invitado a un Reto: " & UserList(Userindex).Name & " (" & UserList(Userindex).Stats.ELV & ") y " & UserList(Tindex).Name & " (" & UserList(Tindex).Stats.ELV & ") Vs " & UserList(Arg1).Name & " (" & UserList(Arg1).Stats.ELV & ") y " & UserList(Arg2).Name & " (" & UserList(Arg2).Stats.ELV & ") .Apuesta: " & RetoDoble.oro & " Monedas de oro. Para aceptar escribe /RETO " & UserList(Userindex).Name & "." & "´" & FONTTYPE_EJECUCION)
    
    
    End If
    
    Exit Sub
    End If
'///////////////////////////// 2 vs 2////////////////////////////////
 
    If UCase$(Left$(rdata, 6)) = "/RETO " Then
    rdata = Right$(rdata, Len(rdata) - 6)
    Tindex = NameIndex(rdata)
    tStr = ReadField(1, rdata, Asc("@"))
    
    If UserList(Userindex).flags.Montura = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes ingresar montado." & "´" & FontTypeNames.FONTTYPE_talk)
        Exit Sub
    End If
    
    
    '/////////////////// REVISO SI ESTA DISPONIBLE? ///////////////////////////
    If RetoDisponible = True Then
         Call SendData(ToIndex, Userindex, 0, "||La sala de Reto 2vs2 no esta disponible." & "´" & FONTTYPE_EJECUCION)
         Exit Sub
    End If
    
    If Not UserList(RetoDoble.Jugador1).Pos.Map = 34 Or Not UserList(RetoDoble.Jugador2).Pos.Map = 34 Or Not UserList(RetoDoble.Jugador3).Pos.Map = 34 Or Not UserList(RetoDoble.Jugador4).Pos.Map = 34 Then
         Call SendData(ToIndex, Userindex, 0, "||Los integrantes del reto deben estar todos en Nix." & "´" & FONTTYPE_EJECUCION)
        Exit Sub
    End If
    
    '//////////////// ACEPTO EL PRIMERO? ////////////////////
    If Userindex = RetoDoble.Jugador2 And Tindex = RetoDoble.Jugador1 Then
    UserList(RetoDoble.Jugador2).flags.AceptoDoble = True
    Call SendData(ToIndex, Userindex, 0, "||Has aceptado el reto, espera a que los demas acepten." & "´" & FONTTYPE_EJECUCION)
    
    Call RetoDoblee
Exit Sub
End If
    
    '//////////////// ACEPTO EL SEGUNDO? ////////////////////
    If Userindex = RetoDoble.Jugador3 And Tindex = RetoDoble.Jugador1 Then
    UserList(RetoDoble.Jugador3).flags.AceptoDoble = True
    Call SendData(ToIndex, Userindex, 0, "||Has aceptado el reto, espera a que los demas acepten." & "´" & FONTTYPE_EJECUCION)
 
    Call RetoDoblee
Exit Sub
End If
    
    '//////////////// ACEPTO EL TERCERO? ////////////////////
    If Userindex = RetoDoble.Jugador4 And Tindex = RetoDoble.Jugador1 Then
    UserList(RetoDoble.Jugador4).flags.AceptoDoble = True
    Call SendData(ToIndex, Userindex, 0, "||Has aceptado el reto, espera a que los demas acepten." & "´" & FONTTYPE_EJECUCION)
    
    Call RetoDoblee
    End If
    Exit Sub
End If
    
'///////////////////////////// 2 vs 2////////////////////////////////
 
 
'/////////////////////////////////////////////////////////////////////////////////////////
If UCase$(Left$(rdata, 7)) = "/DUELO " Then
    rdata = Right$(rdata, Len(rdata) - 7)
    Name = ReadField(1, rdata, Asc("@"))
    tStr = ReadField(2, rdata, Asc("@"))
    If Name = "" Or tStr = "" Then
        Call SendData(ToIndex, Userindex, 0, "||Los Datos son incorrectos" & "´" & FONTTYPE_EJECUCION)
        Exit Sub
    End If
    Tindex = NameIndex(Name)
    Pareja.oro = tStr
    
If Tindex <= 0 Then     'usuario Offline
         Call SendData(ToIndex, Userindex, 0, "||Usuario offline" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
    
If tStr < 1 Then
Call SendData(ToIndex, Userindex, 0, "||La apuesta minima es de 1 Monedas de oro." & "´" & FONTTYPE_EJECUCION)
Exit Sub
End If

    If UserList(Userindex).flags.Montura = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes ingresar montado." & "´" & FontTypeNames.FONTTYPE_talk)
        Exit Sub
    End If
 
 
If tStr > UserList(Userindex).Stats.GLD Then
Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente dinero." & "´" & FONTTYPE_EJECUCION)
Exit Sub
End If
If tStr > UserList(Tindex).Stats.GLD Then
Call SendData(ToIndex, Userindex, 0, "||Tu enemigo no tiene suficiente dinero." & "´" & FONTTYPE_EJECUCION)
Exit Sub
End If
 
If Tindex = Userindex Then   'esta parte evita parejiar con vos mismo
         Call SendData(ToIndex, Userindex, 0, "||No puedes retar contigo mismo" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If UserList(Userindex).flags.Muerto = 1 Then  'tu estas muerto
         Call SendData(ToIndex, Userindex, 0, "||Estas muerto" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If MapInfo(207).NumUsers = 2 Then
         Call SendData(ToIndex, Userindex, 0, "||Sala de reto ocupada." & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If UserList(Tindex).flags.Muerto = 1 Then       'tu enemigo esta muerto
         Call SendData(ToIndex, Userindex, 0, "||Esta muerto" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If UserList(Userindex).Pos.Map = 207 Then          ' <--- mapa del ring (XX)
         Call SendData(ToIndex, Userindex, 0, "||Ya estas en el ring" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If UserList(Tindex).Pos.Map = 207 Then
         Call SendData(ToIndex, Userindex, 0, "||Esta ocupado" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If Not UserList(Userindex).Pos.Map = 34 Then
         Call SendData(ToIndex, Userindex, 0, "||Solo puedes enviar reto desde Nix" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If Not UserList(Tindex).Pos.Map = 34 Then
         Call SendData(ToIndex, Userindex, 0, "||Tu enemigo no se encuentra en Nix" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If MapInfo(207).NumUsers = 0 Then
         UserList(Tindex).flags.EsperaPareja = True
         UserList(Userindex).flags.SuPareja = Tindex
 
If UserList(Userindex).flags.EsperaPareja = False Then
Call SendData(ToIndex, Userindex, 0, "||RETO > Has invitado a un reto a " & UserList(Tindex).Name & " (" & UserList(Tindex).Stats.ELV & "). Apuesta " & tStr & " Monedas de oro." & "´" & FONTTYPE_EJECUCION)
Call SendData(ToIndex, Tindex, 0, "||RETO > " & UserList(Userindex).Name & " (" & UserList(Userindex).Stats.ELV & "), te ha invitado a un reto por " & tStr & " Monedas de oro. Para aceptar escribe /ACEPTO " & UserList(Userindex).Name & "´" & FONTTYPE_EJECUCION)
End If
    End If
    Exit Sub
End If

        If UCase$(Left$(rdata, 9)) = "/ALIANZA " Then
    rdata = Right$(rdata, Len(rdata) - 9)
                If UserList(Userindex).Faccion.ArmadaReal = 1 Then
                    Call SendData(ToCiudadanos, 0, 0, "||" & UserList(Userindex).Name & " > " & rdata & "´" & FontTypeNames.FONTTYPE_ALIANZA)
                    Call SendData(ToAdmins, 0, 0, "||" & UserList(Userindex).Name & " > " & rdata & "´" & FontTypeNames.FONTTYPE_ALIANZA)
                End If
        Exit Sub
        End If
        
     If UCase$(Left$(rdata, 7)) = "/HORDA " Then
                 rdata = Right$(rdata, Len(rdata) - 7)
           If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
 
                    Call SendData(ToCriminales, 0, 0, "||" & UserList(Userindex).Name & " > " & rdata & "´" & FontTypeNames.FONTTYPE_HORDA)
                    Call SendData(ToAdmins, 0, 0, "||" & UserList(Userindex).Name & " > " & rdata & "´" & FontTypeNames.FONTTYPE_HORDA)
                  
                  Exit Sub
            End If
    End If
 
'/////////////////////////////////////////////////////////
'/////////////////////////////////////////////////////////
  
    If UCase$(Left$(rdata, 8)) = "/ACEPTO " Then
    rdata = Right$(rdata, Len(rdata) - 8)
    Tindex = NameIndex(rdata)
    tStr = ReadField(1, rdata, Asc("@"))
    
    If UserList(Userindex).flags.Montura = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes ingresar montado." & "´" & FontTypeNames.FONTTYPE_talk)
        Exit Sub
    End If
    
    Call ACEPTARETO(Userindex, Tindex)
    Exit Sub
    End If
    
    'Sistema de Retos: EZE FIN
    
    'pluto:6.8------------
    If UCase$(Left$(rdata, 11)) = "/DUELOCLAN " Then

        'pluto:6.9
        If UserList(Userindex).Pos.Map = 191 Then Exit Sub
        If UserList(Userindex).Counters.Pena > 0 Then Exit Sub

        rdata = Right$(rdata, Len(rdata) - 10)

        If rdata = "" Or val(rdata) < 2 Or val(rdata) > 6 Then
            Call SendData(ToIndex, Userindex, 0, _
                          "||Debes indicar el número de participantes (entre 2 y 6) con /DUELOCLAN (espacio) Número." & "´" _
                          & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'Case "/DUELOCLAN"
        'TClanOcupado = 0
        If UserList(Userindex).GuildInfo.GuildName = "" Then
            Call SendData(ToIndex, Userindex, 0, "||No perteneces a ningún clan." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UserList(Userindex).GuildInfo.GuildPoints < 4000 Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente rango de clan." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'TClanOcupado = 0
        If TClanOcupado = 0 Then
            TClanOcupado = 0
            TorneoClan(1).Nombre = ""
            TorneoClan(1).numero = 0
            TorneoClan(2).Nombre = ""
            TorneoClan(2).numero = 0
            TClanNumero = val(rdata)
            MsgTorneo = "El Clan " & UserList(Userindex).GuildInfo.GuildName & " busca rival. Duelo de " & _
                        TClanNumero & " Participantes. Si tu clan quiere aceptar el desafío escribe /DUELOCLAN " & TClanNumero & " , luego los que quieran pelear deberán tipear /SIDUELOCLAN"
            Call SendData(ToAll, 0, 0, "||" & MsgTorneo & "´" & FontTypeNames.FONTTYPE_pluto)
            TClanOcupado = 1
            frmMain.Torneo.Enabled = True
            frmMain.Torneo.Interval = 20000
            TorneoClan(1).Nombre = UserList(Userindex).GuildInfo.GuildName
            Exit Sub
        ElseIf TClanOcupado = 1 Then

            If TorneoClan(1).Nombre = UserList(Userindex).GuildInfo.GuildName Then
                Call SendData(ToIndex, Userindex, 0, "||Ya estás apuntado." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If val(rdata) <> TClanNumero Then
                Call SendData(ToIndex, Userindex, 0, "||El Duelo es de " & TClanNumero & _
                                                     " Participantes. Debes escribir /DUELOCLAN " & TClanNumero & ", luego los que quieran pelear deberán tipear /SIDUELOCLAN" & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            TorneoClan(2).Nombre = UserList(Userindex).GuildInfo.GuildName
            Call SendData(ToAll, 0, 0, "||El Clan " & UserList(Userindex).GuildInfo.GuildName & _
                                       " ha aceptado el Desafío." & "´" & FontTypeNames.FONTTYPE_pluto)
            MsgTorneo = "Duelo de Clanes: " & TorneoClan(1).Nombre & " vs " & TorneoClan(2).Nombre & _
                        " en unos instantes se comunicará el nombre de los participantes."
            Call SendData(ToClan, 0, 0, "Duelo de Clanes: " & TorneoClan(1).Nombre & " vs " & TorneoClan(2).Nombre & _
                                        "´" & FontTypeNames.FONTTYPE_pluto)
            TClanOcupado = 2
            frmMain.Torneo.Interval = 10000
        Else
            Call SendData(ToIndex, Userindex, 0, "||Ya hay un duelo disputandose: " & TorneoClan(1).Nombre & " vs " & _
                                                 TorneoClan(2).Nombre & "´" & FontTypeNames.FONTTYPE_pluto)

        End If

    End If

    '------------------------------
    
    'nuevo torneo eze
    If UCase$(Left$(rdata, 10)) = "/DOTORNEO " Then
    rdata = Right$(rdata, Len(rdata) - 10)
    TModalidad = ReadField(1, rdata, Asc("@"))
    
    If UserList(Userindex).flags.Privilegios = 0 Then Exit Sub
    
    If ReadField(1, rdata, Asc("@")) = vbNullString Then
       Call SendData(ToIndex, Userindex, 0, "||La estructura del comando ahora es: /DOTORNEO Modo@Max Participantes@Nivel Minimo.")
    Exit Sub
    End If
    
If Hay_Torneo = True Then
    Call SendData(ToIndex, Userindex, 0, "||Ya hay un torneo /FINALIZAR.")
 Exit Sub
End If
    
If UCase$(TModalidad) = "DM" Then
     CParticipantes = ReadField(2, rdata, Asc("@"))
     TNivelMinimo = ReadField(3, rdata, Asc("@"))
     
    If TNivelMinimo > 62 Then
        Call SendData(ToIndex, Userindex, 0, "||El nivel minimo tiene que ser entre 1 y 62.")
      Exit Sub
    End If
   
    If TNivelMinimo < 1 Then
        Call SendData(ToIndex, Userindex, 0, "||El nivel minimo tiene que ser entre 1 y 62.")
      Exit Sub
    End If
   
    If CParticipantes < 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes utilizar cantidades negativas.")
      Exit Sub
    End If
     
    Call SendData(ToAll, 0, 0, "||" & UserList(Userindex).Name & " ESTA ORGANIZANDO UN TORNEO " & "TODOS CONTRA TODOS " & "PARA " & CParticipantes & ", EL NIVEL MINIMO PARA INGRESAR ES " & TNivelMinimo & ", PARA PARTICIPAR ESCRIBE /PARTICIPAR EN CONSOLA.")
    CuentaTorneo = 10
    UsuariosEnTorneo = 0
    Hay_Torneo = True
    TiroCuentaDM = False

    'Call LogTorneos("" & UserList(userindex).Name & " - Modalidad: " & UCase$(TModalidad) & " - Nivel Minimo: " & TNivelMinimo & " - Participantes: " & CParticipantes)
 Exit Sub
End If
   
    If TModalidad <> 5 Then
     CParticipantes = ReadField(2, rdata, Asc("@"))
     TNivelMinimo = ReadField(3, rdata, Asc("@"))
    Else
     CParticipantes = ReadField(2, rdata, Asc("@"))
     TNivelMinimo = 1
    End If
   
    If TNivelMinimo > 70 Then
        Call SendData(ToIndex, Userindex, 0, "||El nivel minimo tiene que ser entre 1 y 62.")
      Exit Sub
    End If
   
    If TNivelMinimo < 1 Then
        Call SendData(ToIndex, Userindex, 0, "||El nivel minimo tiene que ser entre 1 y 62.")
      Exit Sub
    End If
   
    If CParticipantes < 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes utilizar cantidades negativas.")
      Exit Sub
    End If
   
If Hay_Torneo = False Then
If TModalidad = "1" Or UCase$(TModalidad) = "1VS1" Then
Call SendData(ToAll, 0, 0, "||" & UserList(Userindex).Name & " ESTA ORGANIZANDO UN TORNEO " & "1 VS 1 " & "PARA " & CParticipantes & ", EL NIVEL MINIMO PARA INGRESAR ES " & TNivelMinimo & ", PARA PARTICIPAR ESCRIBE /PARTICIPAR EN CONSOLA.")
CuentaTorneo = 10
UsuariosEnTorneo = 0
Hay_Torneo = True
ElseIf TModalidad = "2" Or UCase$(TModalidad) = "2VS2" Then
Call SendData(ToAll, 0, 0, "||" & UserList(Userindex).Name & " ESTA ORGANIZANDO UN TORNEO " & "2 VS 2 " & "PARA " & CParticipantes & ", EL NIVEL MINIMO PARA INGRESAR ES " & TNivelMinimo & ", PARA PARTICIPAR ESCRIBE /PARTICIPAR EN CONSOLA.")
CuentaTorneo = 10
UsuariosEnTorneo = 0
Hay_Torneo = True
ElseIf TModalidad = "3" Or UCase$(TModalidad) = "3VS3" Then
Call SendData(ToAll, 0, 0, "||" & UserList(Userindex).Name & " ESTA ORGANIZANDO UN TORNEO " & "3 VS 3 " & "PARA " & CParticipantes & ", EL NIVEL MINIMO PARA INGRESAR ES " & TNivelMinimo & ", PARA PARTICIPAR ESCRIBE /PARTICIPAR EN CONSOLA.")
CuentaTorneo = 10
UsuariosEnTorneo = 0
Hay_Torneo = True
ElseIf TModalidad = "4" Or UCase$(TModalidad) = "4VS4" Then
Call SendData(ToAll, 0, 0, "||" & UserList(Userindex).Name & " ESTA ORGANIZANDO UN TORNEO " & "4 VS 4 " & "PARA " & CParticipantes & ", EL NIVEL MINIMO PARA INGRESAR ES " & TNivelMinimo & ", PARA PARTICIPAR ESCRIBE /PARTICIPAR EN CONSOLA.")
CuentaTorneo = 10
UsuariosEnTorneo = 0
Hay_Torneo = True
ElseIf TModalidad = "5" Then
Call SendData(ToAll, 0, 0, "||" & UserList(Userindex).Name & " ESTA ORGANIZANDO UN EVENTO PARA " & CParticipantes & "PARTICIPANTES, ENVIA /PARTICIPAR EN CONSOLA")
PuntosPremios = val(CParticipantes)
UsuariosEnTorneo = 0
Hay_Torneo = True
End If
Else
Call SendData(ToIndex, Userindex, 0, "||Ya hay un torneo /FINALIZAR.")
Exit Sub
End If
 
For tornein = 1 To LastUser
    If UserList(tornein).flags.EnTorneo = 1 Then
        UserList(tornein).flags.EnTorneo = 0
    End If
     
    If UserList(tornein).flags.NumTorneo > 0 Then
        UserList(tornein).flags.NumTorneo = 0
    End If
Next tornein

'Call LogTorneos("" & UserList(userindex).Name & " - Modalidad: " & UCase$(TModalidad) & " - Nivel Minimo: " & TNivelMinimo & " - Participantes: " & CParticipantes)
 
Exit Sub
End If

        
        If UCase$(rdata) = "/FINALIZAR" Then
 
 'If UserList(Userindex).flags.Privilegios < PlayerType.EventManager Then Exit Sub
 If UserList(Userindex).flags.Privilegios = 0 Then Exit Sub
 
If Hay_Torneo = True Then
UsuariosEnTorneo = 0
 

For tornein = 1 To LastUser
If UserList(tornein).flags.EnTorneo = 1 Then
UserList(tornein).flags.EnTorneo = 0
End If
If UserList(tornein).flags.NumTorneo = 1 Then
UserList(tornein).flags.NumTorneo = 0
End If
Next tornein
 
Call SendData(ToAll, 0, 0, "||Torneo finalizado.")
 
Hay_Torneo = False
TModalidad = "0"
PuntosPremios = 0
End If
 
  Exit Sub
End If

    If UCase$(Left$(rdata, 9)) = "/REVISAR " Then
        rdata = Right$(rdata, Len(rdata) - 9)
        Tindex = NameIndex(rdata)
        
        If UserList(Userindex).flags.Privilegios = 0 Then Exit Sub
     
        If Tindex <= 0 Then
            Call SendData(ToIndex, Userindex, 0, "||El usuario no esta online." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
    
        If UserList(Tindex).flags.Privilegios > UserList(Userindex).flags.Privilegios Then
            Call SendData(ToIndex, Userindex, 0, "||No podes echar a alguien con jerarquia mayor a la tuya." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If UserList(Tindex).flags.Revisar = 0 Then
            Call SendData(ToAdmins, 0, 0, "||" & " Estas verificando si el usuario ve cuerpos invisibles: " & UserList(Tindex).Name & "." & "´" & _
                                   FontTypeNames.FONTTYPE_talk)
        UserList(Tindex).flags.Revisar = 1
        
        Call LogGM(UserList(Userindex).Name, " Reviso a: " & UserList(Tindex).Name)
        Exit Sub
        End If
        
        If UserList(Tindex).flags.Revisar = 1 Then
            UserList(Tindex).flags.Revisar = 0
            Call SendData(ToAdmins, 0, 0, "||" & " Dejas de verificar si el usuario ve cuerpos invisibles: " & UserList(Tindex).Name & "." & "´" & _
                                   FontTypeNames.FONTTYPE_talk)
            Call LogGM(UserList(Userindex).Name, " Dejo de revisar a: " & UserList(Tindex).Name)
        Exit Sub
        End If
        Exit Sub
        End If

If UCase(Left(rdata, 14)) = "/DESCALIFICAR " Then
rdata = Right$(rdata, Len(rdata) - 14)
Dim des As String
des = NameIndex(rdata)
If UserList(Userindex).flags.Privilegios = 0 Then Exit Sub

    'If UserList(Userindex).flags.Privilegios < PlayerType.EventManager Then Exit Sub

    If UserList(des).flags.EnTorneo = 1 Then
            UserList(des).flags.EnTorneo = 0
            
            For i = 1 To LastUser
                If UserList(i).flags.NumTorneo > UserList(des).flags.NumTorneo Then
                    UserList(i).flags.NumTorneo = UserList(i).flags.NumTorneo - 1
                End If
            Next i
            
            UserList(des).flags.NumTorneo = 0
            UsuariosEnTorneo = UsuariosEnTorneo - 1
            
            SendData ToAll, 0, 0, "||" & UserList(des).Name & "fue descalificado."
            Call WarpUserChar(des, 28, 50, 50)
    Else
            SendData ToIndex, 0, 0, "||El usuario esta offline o no esta inscipto en el torneo."
    End If

Exit Sub
End If

    Select Case UCase$(rdata)
    
    Case "/MEDITAR"

            'pluto:2.15
            If UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MaxMAN Then Exit Sub

            'pluto.7.0
            If UserList(Userindex).flags.Macreanda > 0 Then Exit Sub

            If UserList(Userindex).flags.Muerto = 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            Call SendData2(ToIndex, Userindex, 0, 54)

            If Not UserList(Userindex).flags.Meditando Then
                Call SendData(ToIndex, Userindex, 0, "||Comenzas a meditar." & "´" & FontTypeNames.FONTTYPE_INFO)
            Else
                Call SendData(ToIndex, Userindex, 0, "G7")
                'pluto:2.5.0
                Call SendData2(ToIndex, Userindex, 0, 15, UserList(Userindex).Pos.X & "," & UserList(Userindex).Pos.Y)

            End If

            UserList(Userindex).flags.Meditando = Not UserList(Userindex).flags.Meditando

            If UserList(Userindex).flags.Meditando Then
                UserList(Userindex).Char.loops = LoopAdEternum

                'Call SendData2(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, 22, UserList(UserIndex).Char.CharIndex & "," & 131 & "," & LoopAdEternum)
                'UserList(UserIndex).Char.FX = 131
                '  Exit Sub
                'pluto:6.5
                If UserList(Userindex).flags.DragCredito5 = 1 Then
                    Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 17 & "," & LoopAdEternum)
                    UserList(Userindex).Char.FX = 17
                    Exit Sub

                End If

                '----------------------
                'pluto:2.14 meditar para remorts
                If UserList(Userindex).Remort > 0 Then

                    If Not Criminal(Userindex) Then

                        Select Case UserList(Userindex).Stats.ELV

                            Case Is < 10
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 98 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 98

                            Case 10 To 19
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 127 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 127

                            Case 20 To 29
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 125 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 125

                            Case 30 To 39
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 117 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 132

                            Case 40 To 49
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 97 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 97

                                'pluto:6.9
                            Case 50 To 59
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 112 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 112

                                'pluto:6.9
                            Case Is > 59
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 112 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 112    '130

                        End Select

                    Else

                        Select Case UserList(Userindex).Stats.ELV

                            Case Is < 10
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 99 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 99

                            Case 10 To 19
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 126 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 126

                            Case 20 To 29
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 124 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 124

                            Case 30 To 39
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 118 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 118

                            Case 40 To 49
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 96 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 96

                                'pluto:6.9
                            Case 50 To 59
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 111 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 111

                                'pluto:6.9
                            Case Is > 59
                                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 111 & "," & LoopAdEternum)
                                UserList(Userindex).Char.FX = 111    '131

                        End Select

                    End If

                    Exit Sub
                End If    'REMORT

                '----------------MEDITACION PARA NO REMORTS------
                If UserList(Userindex).Stats.ELV < 13 Then
                    If UserList(Userindex).Faccion.SoyCaos = 1 Then
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 136 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 136
                    Else
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 135 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 135
                    End If
                    
                ElseIf UserList(Userindex).Stats.ELV < 20 Then
                    If UserList(Userindex).Faccion.SoyCaos = 1 Then
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 138 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 138
                    Else
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 137 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 137
                    End If
                    
                ElseIf UserList(Userindex).Stats.ELV < 30 Then
                    If UserList(Userindex).Faccion.SoyCaos = 1 Then
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 140 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 140
                    Else
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 139 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 139
                    End If
                    
                    
                    
                ElseIf UserList(Userindex).Stats.ELV < 40 Then
                    If UserList(Userindex).Faccion.SoyCaos = 1 Then
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 143 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 143
                    Else
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 142 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 142
                    End If
                        
                ElseIf UserList(Userindex).Stats.ELV < 50 Then

                    If UserList(Userindex).Faccion.SoyReal = 1 Then
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 70 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 70
                    Else
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 69 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 69

                    End If

                ElseIf UserList(Userindex).Stats.ELV > 60 Then

                    If UserList(Userindex).Faccion.SoyReal = 1 Then
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 131 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 131
                    Else
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 130 & "," & LoopAdEternum)
                        UserList(Userindex).Char.FX = 130

                    End If

                ElseIf Not UserList(Userindex).Faccion.SoyCaos = 1 Then
                    Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & FXMEDITARorbitalazul & "," & LoopAdEternum)
                    UserList(Userindex).Char.FX = FXMEDITARorbitalazul
                Else
                    Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & FXMEDITARorbitalrojo & "," & LoopAdEternum)
                    UserList(Userindex).Char.FX = FXMEDITARorbitalrojo

                End If

            Else    'DEJAR DE MEDITAR
                UserList(Userindex).Char.FX = 0
                UserList(Userindex).Char.loops = 0
                'pluto:2-3-04 bug fx meditar
                Call SendData2(ToMap, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & 0 & "," & 0)

            End If

            Exit Sub
            
    End Select
    


    
    
    

    Exit Sub
ErrorComando:
    Call LogError("TCP2. CadOri:" & CadenaOriginal & " Nom:" & UserList(Userindex).Name & "UI:" & Userindex & " N: " _
                  & Err.number & " D: " & Err.Description)
    Call CloseSocket(Userindex)
End Sub

