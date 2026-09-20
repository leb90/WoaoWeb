Attribute VB_Name = "Monturas"

Sub EnviarMontura(ByVal Userindex As Integer, ByVal MON As Byte)

    On Error GoTo errhandler

    Dim i As Integer
    Dim cad$

    'Dim xx As Integer
    'xx = UserList(UserIndex).flags.ClaseMontura
    'tope level
    If PMascotas(MON).TopeLevel = UserList(Userindex).Montura.Nivel(MON) Then UserList(Userindex).Montura.Elu(MON) = 1

    cad$ = UserList(Userindex).Montura.Nivel(MON) & "," & UserList(Userindex).Montura.exp(MON) & "," & UserList( _
           Userindex).Montura.Elu(MON) & "," & UserList(Userindex).Montura.Vida(MON) & "," & UserList( _
           Userindex).Montura.Golpe(MON) & "," & UserList(Userindex).Montura.Nombre(MON) & "," & str$(MON) & "," & _
           UserList(Userindex).Montura.AtCuerpo(MON) & "," & UserList(Userindex).Montura.Defcuerpo(MON) & "," & _
           UserList(Userindex).Montura.AtFlechas(MON) & "," & UserList(Userindex).Montura.DefFlechas(MON) & "," & _
           UserList(Userindex).Montura.AtMagico(MON) & "," & UserList(Userindex).Montura.DefMagico(MON) & "," & _
           UserList(Userindex).Montura.Evasion(MON) & "," & UserList(Userindex).Montura.Libres(MON)
    Call SendData2(ToIndex, Userindex, 0, 35, cad$)
    Exit Sub

errhandler:
    Call LogError("Error en EnviarMontura Nom:" & UserList(Userindex).Name & " UI:" & Userindex & " MON:" & MON & _
                  " N: " & Err.number & " D: " & Err.Description)

    'Call LogError("Error en EnviarMontura User:" & UserIndex & " MON:" & MON)
End Sub

Sub ResetMontura(ByVal Userindex As Integer, ByVal xx As Byte)
    UserList(Userindex).Montura.Nivel(xx) = 0
    UserList(Userindex).Montura.exp(xx) = 0
    UserList(Userindex).Montura.Elu(xx) = 0
    UserList(Userindex).Montura.Vida(xx) = 0
    UserList(Userindex).Montura.Golpe(xx) = 0
    UserList(Userindex).Montura.Nombre(xx) = ""
    UserList(Userindex).Montura.AtCuerpo(xx) = 0
    UserList(Userindex).Montura.Defcuerpo(xx) = 0
    UserList(Userindex).Montura.AtFlechas(xx) = 0
    UserList(Userindex).Montura.DefFlechas(xx) = 0
    UserList(Userindex).Montura.AtMagico(xx) = 0
    UserList(Userindex).Montura.DefMagico(xx) = 0
    UserList(Userindex).Montura.Evasion(xx) = 0
    UserList(Userindex).Montura.Tipo(xx) = 0
    UserList(Userindex).Montura.index(xx) = 0
    UserList(Userindex).Montura.Libres(xx) = 0

End Sub

Sub CheckMonturaLevel(ByVal Userindex As Integer)

    On Error GoTo errhandler

    Dim xx As Integer

    xx = UserList(Userindex).flags.ClaseMontura

    If xx = 0 Then Exit Sub

    If PMascotas(xx).TopeLevel < UserList(Userindex).Montura.Nivel(xx) Then Exit Sub

    'Si exp >= then Exp para subir de nivel entonce subimos el nivel
    If UserList(Userindex).Montura.exp(xx) >= UserList(Userindex).Montura.Elu(xx) Then
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_NIVEL)
        Call SendData(ToIndex, Userindex, 0, "||¡Has subido de nivel tu Mascota !" & "´" & FontTypeNames.FONTTYPE_INFO)

        UserList(Userindex).Montura.Nivel(xx) = UserList(Userindex).Montura.Nivel(xx) + 1
        UserList(Userindex).Montura.exp(xx) = 0
        UserList(Userindex).Montura.Elu(xx) = PMascotas(xx).exp(UserList(Userindex).Montura.Nivel(xx))    'UserList(UserIndex).Montura.Elu(xx) * 1.5
        'pluto:6.0A
        Call SendData(ToIndex, Userindex, 0, "H5" & xx & "," & UserList(Userindex).Montura.Nivel(xx) & "," & UserList( _
                                             Userindex).Montura.Nombre(xx) & "," & (UserList(Userindex).Montura.Elu(xx) - UserList( _
                                                                                    Userindex).Montura.exp(xx)))

        'PMascotas(xx).TopeLevel = UserList(UserIndex).Montura.Nivel(xx) Then
        'pluto:6.0a
        If xx = 5 Or xx = 6 Then
            UserList(Userindex).Montura.Libres(xx) = UserList(Userindex).Montura.Libres(xx) + 0
        Else
            UserList(Userindex).Montura.Libres(xx) = UserList(Userindex).Montura.Libres(xx) + 0

        End If

        'pluto:2.17
        Dim X As Integer
        Dim Y As Integer
        'Dim Expmascota As Integer
        'Expmascota = UserList(UserIndex).Montura.Elu(xx) / UserList(UserIndex).Montura.Nivel(xx)
        X = RandomNumber(CInt(PMascotas(xx).VidaporLevel / 2), CInt(PMascotas(xx).VidaporLevel))
        Y = RandomNumber(CInt(PMascotas(xx).GolpeporLevel / 2), CInt(PMascotas(xx).GolpeporLevel))
        UserList(Userindex).Montura.Vida(xx) = UserList(Userindex).Montura.Vida(xx) + X
        UserList(Userindex).Montura.Golpe(xx) = UserList(Userindex).Montura.Golpe(xx) + Y

    End If

    Exit Sub
errhandler:
    LogError ("Error en la subrutina CheckMonturaLevel")

End Sub

Public Sub UsaMontura(ByVal Userindex As Integer, ByRef Montura As ObjData)

    On Error GoTo errhandler

    Dim X As Integer
    Dim Y As Integer

    If UserList(Userindex).Bebe > 0 Then Exit Sub
    If UserList(Userindex).flags.Navegando = 1 Then Exit Sub
    If UserList(Userindex).flags.Comerciando = True Then Exit Sub

    'pluto:2.14
    If UserList(Userindex).flags.Estupidez = 1 Or UserList(Userindex).Counters.Ceguera = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||¡No puedes usar Mascotas en tu estado !" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    'pluto:2.17
    'If Montura.SubTipo = 5 And UserList(Userindex).Remort = 0 Then
    'Call SendData(ToIndex, Userindex, 0, "||¡Mascota sólo para Remorts !" & FONTTYPENAMES.FONTTYPE_INFO)
    'Exit Sub
    'End If

    'If Not TieneObjetos(960, 1, Userindex) And Montura.SubTipo <> 6 Then
        'Call SendData(ToIndex, Userindex, 0, "P4")
        'Exit Sub

    'End If

    'pluto:6.2
    If UserList(Userindex).Stats.ELV > 29 And Montura.SubTipo = 6 Then
        Call SendData(ToIndex, Userindex, 0, "||¡Tienes demasiado Nivel para usar un Jabato !" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    '-----------

    If UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Morph > 0 Or UserList( _
       Userindex).flags.Demonio > 0 Or UserList(Userindex).flags.Muerto > 0 Then Exit Sub

    If UserList(Userindex).Pos.Map = 164 Or UserList(Userindex).Pos.Map = 171 Or UserList(Userindex).Pos.Map = 177 _
       Then Exit Sub

    'pluto:6.0A
    If UserList(Userindex).Pos.Map = mapi Or UserList(Userindex).Pos.Map = 92 Then Exit Sub
    If UserList(Userindex).Pos.Map > 202 And UserList(Userindex).Pos.Map < 212 Then Exit Sub
    If UserList(Userindex).Pos.Map = 268 Or UserList(Userindex).Pos.Map = 269 Then Exit Sub

    If UserList(Userindex).flags.Montura = 2 Then Exit Sub

    If UserList(Userindex).flags.Montura = 0 Then

        'UserList(UserIndex).Char.Head = 0
        'UserList(UserIndex).flags.DragCredito1 = 1
        'pluto:6.9 dragon negro sms
        If Montura.Ropaje = 306 Then
            If UserList(Userindex).flags.DragCredito1 = 1 Then Montura.Ropaje = 408

            'pluto:6.5 dragon rojo sms
            If UserList(Userindex).flags.DragCredito1 = 2 Then Montura.Ropaje = 409

            'pluto:6.5 dragon azul sms
            If UserList(Userindex).flags.DragCredito1 = 3 Then Montura.Ropaje = 420

            'pluto:6.5 dragon violeta sms
            If UserList(Userindex).flags.DragCredito1 = 4 Then Montura.Ropaje = 421

            'pluto:6.5 dragon blanco sms
            If UserList(Userindex).flags.DragCredito1 = 5 Then Montura.Ropaje = 419

        End If

        'pluto:6.5 uni dorado sms
        If UserList(Userindex).flags.DragCredito2 = 1 And Montura.Ropaje = 275 Then Montura.Ropaje = 422

        'pluto:6.5 uni rojo sms
        If UserList(Userindex).flags.DragCredito2 = 2 And Montura.Ropaje = 275 Then Montura.Ropaje = 423
        'pluto:6.9
        'If UserList(UserIndex).flags.DragCredito1 = 6 Then Montura.Ropaje = 365
        '------------------------
        UserList(Userindex).Char.Body = Montura.Ropaje

        UserList(Userindex).flags.ClaseMontura = Montura.SubTipo
        UserList(Userindex).Stats.PesoMax = UserList(Userindex).Stats.PesoMax + (UserList( _
                                                                                 Userindex).flags.ClaseMontura * 100)
        Call SendUserStatsPeso(Userindex)
        'pluto:6.0A
        Call SendData(ToIndex, Userindex, 0, "H5" & Montura.SubTipo & "," & UserList(Userindex).Montura.Nivel( _
                                             Montura.SubTipo) & "," & UserList(Userindex).Montura.Nombre(Montura.SubTipo) & "," & (UserList( _
                                                                                                                                   Userindex).Montura.Elu(Montura.SubTipo) - UserList(Userindex).Montura.exp(Montura.SubTipo)))

        ' UserList(userindex).Char.ShieldAnim = NingunEscudo
        'UserList(userindex).Char.WeaponAnim = NingunArma
        'UserList(userindex).Char.CascoAnim = NingunCasco
        UserList(Userindex).Char.Botas = NingunBota
        'UserList(Userindex).Char.AlasAnim = NingunAla
        UserList(Userindex).flags.Montura = 1

        If UserList(Userindex).Montura.Nivel(Montura.SubTipo) = 1 Then
            'UserList(UserIndex).flags.Estupidez = 1
            Call SendData2(ToIndex, Userindex, 0, 3)

        End If

    Else    '<>montura=0
        UserList(Userindex).flags.Estupidez = 0
        Call SendData2(ToIndex, Userindex, 0, 56)
        UserList(Userindex).flags.Montura = 0
        UserList(Userindex).Stats.PesoMax = UserList(Userindex).Stats.PesoMax - (UserList( _
                                                                                 Userindex).flags.ClaseMontura * 100)
        Call SendUserStatsPeso(Userindex)
        'pluto:6.0A
        Call SendData(ToIndex, Userindex, 0, "H7")

        If UserList(Userindex).flags.Muerto = 0 Then
            UserList(Userindex).Char.Head = UserList(Userindex).OrigChar.Head

            If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
                UserList(Userindex).Char.Body = ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex).Ropaje
            Else
                Call DarCuerpoDesnudo(Userindex)

            End If

            If UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then UserList(Userindex).Char.ShieldAnim = ObjData( _
               UserList(Userindex).Invent.EscudoEqpObjIndex).ShieldAnim

            If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then UserList(Userindex).Char.WeaponAnim = ObjData( _
               UserList(Userindex).Invent.WeaponEqpObjIndex).WeaponAnim

            If UserList(Userindex).Invent.CascoEqpObjIndex > 0 Then UserList(Userindex).Char.CascoAnim = ObjData( _
               UserList(Userindex).Invent.CascoEqpObjIndex).CascoAnim

            If UserList(Userindex).Invent.BotaEqpObjIndex > 0 Then UserList(Userindex).Char.Botas = ObjData(UserList( _
                                                                                                            Userindex).Invent.BotaEqpObjIndex).Botas

            If UserList(Userindex).Invent.AlaEqpObjIndex > 0 Then UserList(Userindex).Char.AlasAnim = ObjData( _
               UserList(Userindex).Invent.AlaEqpObjIndex).AlasAnim

        Else    'muerto

            If Not Criminal(Userindex) Then UserList(Userindex).Char.Body = iCuerpoMuerto Else UserList( _
               Userindex).Char.Body = iCuerpoMuerto2

            If Not Criminal(Userindex) Then UserList(Userindex).Char.Head = iCabezaMuerto Else UserList( _
               Userindex).Char.Head = iCabezaMuerto2
            UserList(Userindex).Char.ShieldAnim = NingunEscudo
            UserList(Userindex).Char.WeaponAnim = NingunArma
            UserList(Userindex).Char.CascoAnim = NingunCasco
            UserList(Userindex).Char.Botas = NingunBota
            UserList(Userindex).Char.AlasAnim = NingunAla

        End If

    End If

    Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Char.Body, UserList( _
                                                                                                         Userindex).Char.Head, UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, UserList( _
                                                                                                                                                                                                      Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList(Userindex).Char.Botas, UserList( _
                                                                                                                                                                                                                                                                                                      Userindex).Char.AlasAnim)

    'pluto:6.0A silueta mascota
    'If UserInventory(iX).OBJType = 60 Then
    'frmMain.LogoMascota.Picture = LoadPicture(App.Path & "\graficos\" & val(UserInventory(iX).SubTipo) & ".jpg")
    'frmMain.LogoMascota.Visible = True
    'End If
    '----------------------------

    'Call SendData(ToIndex, UserIndex, 0, "NAVEG")
    Exit Sub

errhandler:
    Call LogError("Error en UsaMontura")

End Sub

Sub DarMontura(ByVal Userindex As Integer, ByVal rdata As String)

    On Error GoTo errhandler

    Dim UserFile As String
    Dim userfile2 As String
    Dim Name As String

    'pluto:6.3
    If rdata = "" Then Exit Sub
    Name = rdata & "$"
    Tindex = NameIndex(Name)

    If Tindex > 0 Then
        Call SendData(ToIndex, Userindex, 0, "|| Ese usuario está Online, usa el /comerciar para pasarle la mascota." _
                                             & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    UserFile = CharPath & Left$(rdata, 1) & "\" & rdata & ".chr"
    userfile2 = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"

    'modifica ficha
    If FileExist(UserFile, vbArchive) Then    'And FileExist(userfile2, vbArchive) Then

        Dim X1 As Byte
        Dim X2 As Long
        Dim x3 As Long
        Dim x4 As Integer
        Dim x5 As Integer
        Dim x6 As String
        Dim x7 As Byte
        Dim x8 As Byte
        Dim x9 As Byte
        Dim x10 As Byte
        Dim x11 As Byte
        Dim x12 As Byte
        Dim x13 As Byte
        Dim x14 As Byte
        Dim x15 As Byte
        Dim x16 As Byte

        xx = UserList(Userindex).flags.ClaseMontura

        Dim xxx As Byte    'index de la mascota 1 a 3

        'buscamos un hueco
        For n = 1 To 3

            If val(GetVar(UserFile, "MONTURA" & n, "TIPO")) = 0 Then
                xxx = n    'index de la mascota 1 a 3
                Exit For

            End If

        Next n

        'salimos sin hueco
        If xxx = 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Ese Pj ya tiene el tope de Mascotas" & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

            Exit Sub

        End If

        'pluto:6.0A
        If val(GetVar(UserFile, "INIT", "Bebe")) > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Los bebes no usan mascotas." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'miramos que no repita mascota
        For n = 1 To 3

            If val(GetVar(UserFile, "MONTURA" & n, "TIPO")) = xx Then
                Call SendData(ToIndex, Userindex, 0, "||Ese Personaje ya tiene esa clase de mascota.." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

        Next n

        'Call LogMascotas("Dar mascota: " & " Metemos Tipo " & xx & " EN INDEX " & xxx & " del user " & rdata)

        'carga en las variables Xn las caracteristicas de la montura
        X1 = UserList(Userindex).Montura.Nivel(xx)
        X2 = UserList(Userindex).Montura.exp(xx)
        x3 = UserList(Userindex).Montura.Elu(xx)
        x4 = UserList(Userindex).Montura.Vida(xx)
        x5 = UserList(Userindex).Montura.Golpe(xx)
        x6 = UserList(Userindex).Montura.Nombre(xx)
        x7 = UserList(Userindex).Montura.AtCuerpo(xx)
        x8 = UserList(Userindex).Montura.Defcuerpo(xx)
        x9 = UserList(Userindex).Montura.AtFlechas(xx)
        x10 = UserList(Userindex).Montura.DefFlechas(xx)
        x11 = UserList(Userindex).Montura.AtMagico(xx)
        x12 = UserList(Userindex).Montura.DefMagico(xx)
        x13 = UserList(Userindex).Montura.Evasion(xx)
        x14 = UserList(Userindex).Montura.Libres(xx)
        x15 = UserList(Userindex).Montura.Tipo(xx)
        'Graba en la ficha del Pj receptor la mascota con sus caracteristicas
        Call WriteVar(UserFile, "MONTURA" & xxx, "NIVEL", val(X1))
        Call WriteVar(UserFile, "MONTURA" & xxx, "EXP", val(X2))
        Call WriteVar(UserFile, "MONTURA" & xxx, "ELU", val(x3))
        Call WriteVar(UserFile, "MONTURA" & xxx, "VIDA", val(x4))
        Call WriteVar(UserFile, "MONTURA" & xxx, "GOLPE", val(x5))
        Call WriteVar(UserFile, "MONTURA" & xxx, "NOMBRE", x6)
        Call WriteVar(UserFile, "MONTURA" & xxx, "ATCUERPO", val(x7))
        Call WriteVar(UserFile, "MONTURA" & xxx, "DEFCUERPO", val(x8))
        Call WriteVar(UserFile, "MONTURA" & xxx, "ATFLECHAS", val(x9))
        Call WriteVar(UserFile, "MONTURA" & xxx, "DEFFLECHAS", val(x10))
        Call WriteVar(UserFile, "MONTURA" & xxx, "ATMAGICO", val(x11))
        Call WriteVar(UserFile, "MONTURA" & xxx, "DEFMAGICO", val(x12))
        Call WriteVar(UserFile, "MONTURA" & xxx, "EVASION", val(x13))
        Call WriteVar(UserFile, "MONTURA" & xxx, "LIBRES", val(x14))
        Call WriteVar(UserFile, "MONTURA" & xxx, "TIPO", val(x15))
        Dim Nmascorecep As Byte
        Call LogMascotas("Dar mascota: " & UserList(Userindex).Name & " da su " & x6 & " a " & rdata & " EN INDEX " & _
                         xxx)

        Nmascorecep = val(GetVar(UserFile, "MONTURAS", "NroMonturas"))
        Call LogMascotas("Dar mascota: " & rdata & " tenia " & Nmascorecep)
        Nmascorecep = Nmascorecep + 1
        Call WriteVar(UserFile, "MONTURAS", "NroMonturas", val(Nmascorecep))
        Call LogMascotas("Dar mascota: " & rdata & " ahora tiene " & Nmascorecep)

        'Elimina la mascota del registro del dueño original
        UserList(Userindex).Montura.Nivel(xx) = 0
        UserList(Userindex).Montura.exp(xx) = 0
        UserList(Userindex).Montura.Elu(xx) = 0
        UserList(Userindex).Montura.Vida(xx) = 0
        UserList(Userindex).Montura.Golpe(xx) = 0
        UserList(Userindex).Montura.Nombre(xx) = ""
        UserList(Userindex).Montura.AtCuerpo(xx) = 0
        UserList(Userindex).Montura.AtFlechas(xx) = 0
        UserList(Userindex).Montura.AtMagico(xx) = 0
        UserList(Userindex).Montura.Defcuerpo(xx) = 0
        UserList(Userindex).Montura.DefFlechas(xx) = 0
        UserList(Userindex).Montura.DefMagico(xx) = 0
        UserList(Userindex).Montura.Evasion(xx) = 0
        UserList(Userindex).Montura.Tipo(xx) = 0
        UserList(Userindex).Montura.Libres(xx) = 0
        UserList(Userindex).Montura.index(xx) = 0
        'UserFile = App.Path & "\charfile\" & UCase$(UserList(UserIndex).name) & ".chr"

        'Elimina la mascota de la ficha del dueño original
        For n = 1 To 3

            If val(GetVar(userfile2, "MONTURA" & n, "TIPO")) = xx Then
                zzz = n    'index mascota 1-3 dueño

            End If

        Next n

        Call LogMascotas("Dar mascota: " & UserList(Userindex).Name & " CERO EN INDEX " & zzz)

        Call WriteVar(userfile2, "MONTURA" & zzz, "NIVEL", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "EXP", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "ELU", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "VIDA", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "GOLPE", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "NOMBRE", "")
        Call WriteVar(userfile2, "MONTURA" & zzz, "ATCUERPO", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "DEFCUERPO", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "ATFLECHAS", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "DEFFLECHAS", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "ATMAGICO", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "DEFMAGICO", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "EVASION", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "LIBRES", 0)
        Call WriteVar(userfile2, "MONTURA" & zzz, "TIPO", 0)

        Call QuitarObjetos(UserList(Userindex).flags.ClaseMontura + 887, 1, Userindex)
        Call LogMascotas("Dar mascota: " & UserList(Userindex).Name & " quitar objeto " & UserList( _
                         Userindex).flags.ClaseMontura + 887)

        'quita
        Dim i As Integer

        For i = 1 To MAXMASCOTAS

            If UserList(Userindex).MascotasIndex(i) > 0 Then
                If Npclist(UserList(Userindex).MascotasIndex(i)).Contadores.TiempoExistencia = 0 Then
                    Npclist(UserList(Userindex).MascotasIndex(i)).MaestroUser = 0
                    Npclist(UserList(Userindex).MascotasIndex(i)).Movement = Npclist(UserList( _
                                                                                     Userindex).MascotasIndex(i)).flags.OldMovement
                    Npclist(UserList(Userindex).MascotasIndex(i)).Hostile = Npclist(UserList(Userindex).MascotasIndex( _
                                                                                    i)).flags.OldHostil
                    Call QuitarNPC(UserList(Userindex).MascotasIndex(i))
                    UserList(Userindex).MascotasIndex(i) = 0
                    UserList(Userindex).MascotasType(i) = 0

                End If

            End If

        Next i

        UserList(Userindex).Nmonturas = UserList(Userindex).Nmonturas - 1
        UserList(Userindex).flags.Montura = 0
        Call WriteVar(userfile2, "MONTURAS", "NroMonturas", val(UserList(Userindex).Nmonturas))
        Call LogMascotas("Dar mascota: " & UserList(Userindex).Name & " ahora tiene " & UserList(Userindex).Nmonturas)
        Call SendData(ToIndex, Userindex, 0, "||La Mascota ha sido enviada a " & rdata & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)

        'si esta online
        '[Tite]Soluciona el bug que duplicaba mascotas
        'Name = rdata
        'Name = rdata & "$"
        '[\Tite]
        'If Name = "" Then Exit Sub
        '   Tindex = NameIndex(Name)
        'If Tindex <= 0 Then GoTo yap
        'UserList(Tindex).Montura.Nivel(xx) = val(x1)
        'UserList(Tindex).Montura.exp(xx) = val(x2)
        'UserList(Tindex).Montura.Elu(xx) = val(x3)
        'UserList(Tindex).Montura.Vida(xx) = val(x4)
        'UserList(Tindex).Montura.Golpe(xx) = val(x5)
        'UserList(Tindex).Montura.Nombre(xx) = x6
        'UserList(Tindex).Montura.AtCuerpo(xx) = val(x7)
        'UserList(Tindex).Montura.DefCuerpo(xx) = val(x8)
        'UserList(Tindex).Montura.AtFlechas(xx) = val(x9)
        'UserList(Tindex).Montura.DefFlechas(xx) = val(x10)
        'UserList(Tindex).Montura.AtMagico(xx) = val(x11)
        'UserList(Tindex).Montura.DefMagico(xx) = val(x12)
        'UserList(Tindex).Montura.Evasion(xx) = val(x13)
        'UserList(Tindex).Montura.Libres(xx) = val(x14)
        'UserList(Tindex).Montura.Tipo(xx) = val(x15)
        'UserList(Tindex).Montura.index(xx) = zzz
        'UserList(Tindex).Nmonturas = UserList(Tindex).Nmonturas + 1
yap:
    Else
        Call SendData(ToIndex, Userindex, 0, "||El usuario no existe" & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    Exit Sub

errhandler:
    Call LogError("Error en DarMontura: " & UserList(Userindex).Name)

    'End If
End Sub

Sub DomarMontura(ByVal Userindex As Integer, ByVal NpcIndex As Integer)

    On Error GoTo errhandler

    Dim n As Byte
    Dim tc As Integer

    Dim UserFile As String

    UserFile = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"

    tc = Npclist(NpcIndex).flags.Domable + 387
    'If Npclist(NpcIndex).Numero < 621 Then
    'tc = Npclist(NpcIndex).Numero + 272
    'Else
    'tc = Npclist(npcinde).Numero + 224
    'End If

    Dim nPos As WorldPos
    Dim MiObj As obj
    MiObj.Amount = 1
    MiObj.ObjIndex = tc

    If TieneObjetos(tc, 1, Userindex) Then
        NoDomarMontura = True
        Exit Sub

    End If

    'miramos que no repita mascota
    For n = 1 To 3

        If val(GetVar(UserFile, "MONTURA" & n, "TIPO")) = Npclist(NpcIndex).flags.Domable - 500 Then
            Call SendData(ToIndex, Userindex, 0, _
                          "||Ya tienes esa clase de mascota, ve a la cuidadora de mascotas en Banderbill a recuperarla." & _
                          "´" & FontTypeNames.FONTTYPE_INFO)
            NoDomarMontura = True
            Exit Sub

        End If

    Next n

    'Dim K As Integer
    'K = RandomNumber(1, 1000)
    'If Npclist(npcindex).Flags.Domable <= 1000 Then 'CalcularPoderDomador(UserIndex) And K > 500 Then
    If Not MeterItemEnInventario(Userindex, MiObj) Then
        Call SendData(ToIndex, Userindex, 0, "P5")
        NoDomarMontura = True
        Exit Sub

    End If

    'pluto:6.5
    If UserList(Userindex).flags.Macreanda > 0 Then
        UserList(Userindex).flags.ComproMacro = 0
        UserList(Userindex).flags.Macreanda = 0
        Call SendData(ToIndex, Userindex, 0, "O3")

    End If

    '---------------------------

    Call SendData(ToIndex, Userindex, 0, "||La criatura te ha aceptado como su amo." & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)
    Call LogMascotas("Domar: " & UserList(Userindex).Name & " doma un " & Npclist(NpcIndex).Name)
    Call SubirSkill(Userindex, Domar)
    Call QuitarNPC(NpcIndex)
    Dim xx As Integer
    Dim X As Integer
    Dim Y As Integer

    Dim Expmascota As Integer
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

    'If Not MeterItemEnInventario(userindex, MiObj) Then
    'Call TirarItemAlPiso(UserList(userindex).pos, MiObj)
    'End If

    'Else
    'Call SendData(ToIndex, UserIndex, 0, "P3")
    'End If
    'fin pluto:2.3
    Exit Sub

errhandler:
    Call LogError("Error en DomarMontura")

End Sub

Sub MontarSoltar(ByVal Userindex As Integer, ByVal Slot As Byte)

    On Error GoTo errhandler

    If haciendoBK = True Then Exit Sub
    'pluto:2.3
    If ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).OBJType = 60 Then

        'pluto:2.17
        'If ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).SubTipo = 5 And UserList(Userindex).Remort = 0 Then
        'Call SendData(ToIndex, Userindex, 0, "||¡Mascota sólo para Remorts !" & FONTTYPENAMES.FONTTYPE_INFO)
        'Exit Sub
        'End If
        '--------------------------

        'pluto:6.0A
        If UserList(Userindex).flags.Muerto = 1 Or UserList(Userindex).flags.Navegando = 1 Then Exit Sub
        If MapInfo(UserList(Userindex).Pos.Map).Monturas = 1 Then Exit Sub

        'pluto:6.8
        If UserList(Userindex).Bebe > 0 Then Exit Sub

        'ropa cabalgar y no jabato
        If Not TieneObjetos(960, 1, Userindex) And ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).SubTipo _
           <> 6 Then
            Call SendData(ToIndex, Userindex, 0, "P4")
            Exit Sub

        End If

        'pluto:6.9
        If UserList(Userindex).Stats.ELV > 29 And ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).SubTipo = _
           6 Then
            Call SendData(ToIndex, Userindex, 0, "||¡Tienes demasiado Nivel para usar un Jabato !" & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        '-----------

        If UserList(Userindex).flags.Montura = 2 Then
            Dim a As Integer
            a = UserList(Userindex).Stats.Peso

            Dim i As Integer

            For i = 1 To MAXMASCOTAS

                If UserList(Userindex).MascotasIndex(i) > 0 Then
                    If Npclist(UserList(Userindex).MascotasIndex(i)).Contadores.TiempoExistencia = 0 Then
                        Npclist(UserList(Userindex).MascotasIndex(i)).MaestroUser = 0
                        Npclist(UserList(Userindex).MascotasIndex(i)).Movement = Npclist(UserList( _
                                                                                         Userindex).MascotasIndex(i)).flags.OldMovement
                        Npclist(UserList(Userindex).MascotasIndex(i)).Hostile = Npclist(UserList( _
                                                                                        Userindex).MascotasIndex(i)).flags.OldHostil
                        Call QuitarNPC(UserList(Userindex).MascotasIndex(i))
                        UserList(Userindex).MascotasIndex(i) = 0
                        UserList(Userindex).MascotasType(i) = 0

                    End If

                End If

            Next i

            UserList(Userindex).NroMacotas = UserList(Userindex).NroMacotas - 1
            UserList(Userindex).flags.Montura = 0
            'UserList(UserIndex).Stats.PesoMax = UserList(UserIndex).Stats.PesoMax - (UserList(UserIndex).Flags.ClaseMontura * 100)
            UserList(Userindex).flags.ClaseMontura = 0
            Call UseInvItem(Userindex, Slot)

            Exit Sub

        End If

        Dim ind As Integer, index As Integer

        If UserList(Userindex).NroMacotas < MAXMASCOTAS Then
            ind = SpawnNpc(ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).Clave, UserList(Userindex).Pos, _
                           False, False)

            If ind = MAXNPCS Then
                Call SendData(ToIndex, Userindex, 0, "||No hay sitio para tu mascota." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            If ind < MAXNPCS Then
                UserList(Userindex).NroMacotas = UserList(Userindex).NroMacotas + 1

                index = FreeMascotaIndex(Userindex)

                UserList(Userindex).MascotasIndex(index) = ind
                UserList(Userindex).MascotasType(index) = Npclist(ind).numero

                Npclist(ind).MaestroUser = Userindex

                If UserList(Userindex).flags.Montura = 1 Then Call UseInvItem(Userindex, Slot)
                UserList(Userindex).flags.ClaseMontura = ObjData(UserList(Userindex).Invent.Object( _
                                                                 Slot).ObjIndex).SubTipo
                UserList(Userindex).flags.Montura = 2

                Npclist(ind).Stats.MinHP = UserList(Userindex).Montura.Vida(UserList(Userindex).flags.ClaseMontura)
                Npclist(ind).Stats.MaxHP = UserList(Userindex).Montura.Vida(UserList(Userindex).flags.ClaseMontura)
                'pluto:2.4
                'UserList(UserIndex).Stats.PesoMax = UserList(UserIndex).Stats.PesoMax + (UserList(UserIndex).Flags.ClaseMontura * 100)

                Call FollowAmo(ind)
            Else
                Exit Sub

            End If

        End If

        Exit Sub

    End If

    ' pluto:2.3
    Exit Sub

errhandler:
    Call LogError("Error en MontarSoltar")

End Sub

