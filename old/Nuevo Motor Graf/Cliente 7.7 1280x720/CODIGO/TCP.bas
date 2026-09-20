Attribute VB_Name = "Mod_TCP"
Option Explicit
Public Warping        As Boolean
Public LlegaronSkills As Boolean
Public LlegaronAtrib  As Boolean
Public LlegoFama      As Boolean
Public LLegoEsta      As Boolean
'Public BytesRecibidos As Long
'Public BytesEnviados As Long

Sub HandleData(ByVal Rdata As String)

    'On Error Resume Next

    Dim pt1       As Byte
    Dim retVal    As Variant
    Dim x         As Integer
    Dim y         As Integer
    Dim CharIndex As Integer
    Dim TempInt   As Integer
    Dim TempStr   As String
    Dim Slot      As Integer
    Dim MapNumber As String
    Dim i         As Integer, k As Integer
    Dim cad$, Index As Integer, M As Integer
    Dim Lolo      As String
    Dim IndexObj  As Integer
    'BytesRecibidos = BytesRecibidos + Len(Rdata)

    Dim sData     As String

    'pluto:2.5.0
    If KeyCodi = "" Then GoTo nop
    KeyCodi = Keycodi2
    Rdata = CodificaR(KeyCodi, Rdata, 2)
nop:

    'pluto:6.8 quito de aqui, lo pongo abajo el ucase
    sData = Rdata

    If sData = "" Then Exit Sub

    'Select Case Asc(Left(sData, 1))
    If Asc(Left$(sData, 1)) = 5 Then
        'Case 5
        Dim id As Integer
        Dim aa As String
        Dim ae As Integer

        aa = Right$(sData, Len(sData) - 1)
        ae = Asc(aa)
        id = Asc(Right$(sData, Len(sData) - 1))
        'pluto:6.8
        sData = UCase(Rdata)

        Select Case id

            Case 2    '"CEGUE" ---> ceguera
                UserCiego = True

            Case 3    '"DUMB" ---> estupidez
                UserEstupido = True

            Case 4    '"LOGGED" ---> login
                '            frmCuentas.Visible = False

                Party.numMiembros = 0
                Party.numSolicitudes = 0
                Dim llp As Integer

                For llp = 1 To MAXMIEMBROS
                    Party.Solicitudes(llp) = 0
                    Party.Miembros(llp).Nombre = 0
                Next
                logged = True
                UserCiego = False
                EngineRun = True
                'IScombate = False
                UserDescansar = False
                Nombres = True

                If frmCrearPersonaje.Visible Then
                    Unload frmPasswd
                    Unload frmCrearPersonaje
                    Unload frmConnect
                    frmMain.Show

                End If

                Call SetConnected
        
                bTecho = IIf(MapData(UserPos.x, UserPos.y).Trigger = 1 Or MapData(UserPos.x, UserPos.y).Trigger = 2 Or MapData(UserPos.x, _
                        UserPos.y).Trigger = 4, True, False)
                Call DoFogataFx

            Case 5
                Call Dialogos.RemoveAllDialogs

            Case 6

                UserNavegando = Not UserNavegando

            Case 7
                'frmMain.Socket1.Disconnect
                'pluto:2.4.5
                frmMain.Visible = False
                logged = False
                UserParalizado = False
                UserCiego = False
                'IScombate = False
                pausa = False
                EnDuelo = False
                UserMeditar = False
                UserDescansar = False
                UserNavegando = False
                'pluto:6.2
                Macreando = 0
                'frmConnect.Visible = True
                frmOldPersonaje.Visible = False
                frmPasswd.Visible = False
                frmCrearPersonaje.Visible = False
                frmCuentas.Visible = True
                frmCarp.Visible = False
                frmHerrero.Visible = False
                '-----------------------
                Call Audio.StopMidi
                IsPlaying = plNone
                bRain = False
                bFogata = False
                SkillPoints = 0
                'frmMain.Label1.Visible = False
                Call Dialogos.RemoveAllDialogs

                For i = 1 To LastChar
                    CharList(i).invisible = False
                Next i

                bO = 0
                bK = 0
                EngineRun = False
                Unload frmMiniMap
                HayMiniMap = False

            Case 8
                frmComerciar.List1(0).Clear
                frmComerciar.List1(1).Clear
                NPCInvDim = 0
                Unload frmComerciar
                Comerciando = False
                'If frmMain.picInv.Visible Then frmMain.picInv.SetFocus
                ' If frmMain.hlst.Visible Then frmMain.hlst.SetFocus

            Case 9
                frmBancoObj.List1(0).Clear
                frmBancoObj.List1(1).Clear
                NPCInvDim = 0
                Unload frmBancoObj
                Comerciando = False
                '   If frmMain.picInv.Visible Then frmMain.picInv.SetFocus
                'If frmMain.hlst.Visible Then frmMain.hlst.SetFocus

            Case 10
                i = 1

                Do While i <= MAX_INVENTORY_SLOTS

                    If Inventario.ObjIndex(i) <> 0 Then
                        frmComerciar.List1(1).AddItem Inventario.Name(i)
                    Else
                        frmComerciar.List1(1).AddItem "Nada"

                    End If

                    i = i + 1
                Loop
                Comerciando = True
                frmComerciar.Show

            Case 98
                Dim II As Integer
                II = 1

                Do While II <= MAX_INVENTORY_SLOTS

                    If Inventario.ObjIndex(II) <> 0 Then
                        frmBancoObj.List1(1).AddItem Inventario.Name(II)
                    Else
                        frmBancoObj.List1(1).AddItem "Nada"

                    End If

                    II = II + 1
                Loop
                i = 1

                Do While i <= UBound(UserClanInventory)

                    If UserClanInventory(i).ObjIndex <> 0 Then
                        frmBancoObj.List1(0).AddItem UserClanInventory(i).Name
                    Else
                        frmBancoObj.List1(0).AddItem "Nada"

                    End If

                    i = i + 1
                Loop
                Comerciando = True
                frmBancoObj.Show

            Case 11

                II = 1

                Do While II <= MAX_INVENTORY_SLOTS

                    If Inventario.ObjIndex(II) <> 0 Then
                        frmBancoObj.List1(1).AddItem Inventario.Name(II)
                    Else
                        frmBancoObj.List1(1).AddItem "Nada"

                    End If

                    II = II + 1
                Loop
                i = 1

                Do While i <= UBound(UserBancoInventory)

                    If UserBancoInventory(i).ObjIndex <> 0 Then
                        frmBancoObj.List1(0).AddItem UserBancoInventory(i).Name
                    Else
                        frmBancoObj.List1(0).AddItem "Nada"

                    End If

                    i = i + 1
                Loop
                Comerciando = True
                frmBancoObj.Show

            Case 16    '"NOVER" ---> Invisibilidad
                Dim Bnull As Boolean
                Dim BRky  As Boolean

                Bnull = (Val(ReadField(2, Rdata, 44)) = 1)
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                CharIndex = Val(ReadField(1, Rdata, 44))
                BRky = CharList(CharIndex).invisible
                BRky = (Val(ReadField(2, Rdata, 44)) = 1)
                CharList(CharIndex).invisible = BRky    'aca se le asigna al char un booleano

                If (Not CharList(CharIndex).invisible) Then
                    CharList(CharIndex).invisible = Bnull

                End If
                
                Call SetCharacterTag(CharIndex)
                Exit Sub
                
            Case 12
                frmHerrero.Show
                'If frmMain.picInv.Visible Then frmMain.picInv.SetFocus
                'If frmMain.hlst.Visible Then frmMain.hlst.SetFocus

            Case 13

                frmCarp.Show
                frmCarp.Label1(0).Caption = UserClase
                'If frmMain.picInv.Visible Then frmMain.picInv.SetFocus
                'If frmMain.hlst.Visible Then frmMain.hlst.SetFocus

            Case 14
                EngineRun = True
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserMap = ReadField(1, Rdata, 44)

                'Obtiene la version del mapa
                If FileExist(DirMapas & "Mapa" & UserMap & ".map", vbNormal) Then
       
                    'Si es la vers correcta cambiamos el mapa
                    Call SwitchMap(UserMap)

                    If bLluvia(UserMap) = 0 Then

                        If bRain Then

                            If SoundLluviaIndex > 0 Then Call Audio.StopWave(SoundLluviaIndex)
                            SoundLluviaIndex = 0
                            IsPlaying = plNone

                        End If

                    End If

                    'pluto:6.0A
                    If Segura(UserMap) = 1 Then
                        ECiudad = True
                        EstadoCiudad = "Estás en una Ciudad Segura."
                    ElseIf Segura(UserMap) = 2 Then
                        ECiudad = True
                        EstadoCiudad = "Esta Ciudad es Segura sólo Para Criminales"
                    ElseIf Segura(UserMap) = 3 Then
                        ECiudad = True
                        EstadoCiudad = "Esta Ciudad es Segura sólo Para Ciudadanos"
                    ElseIf Segura(UserMap) = 4 Then
                        ECiudad = True
                        EstadoCiudad = "¡¡Cuidado!! Esta Ciudad es Insegura"
                    ElseIf Segura(UserMap) = 5 Then
                        ECiudad = True
                        EstadoCiudad = "Esta Ciudad es Segura sólo Para Newbies."
                    Else
                        ECiudad = False
                        EstadoCiudad = vbNullString

                    End If

                    'pluto:7.0 calculamos color luz aviso
                    Select Case UserLvl - luzaviso(UserMap)

                        Case -10 To 10
                            Luzaviso2 = 2

                        Case Is > 10
                            Luzaviso2 = 1

                        Case Is < -10
                            Luzaviso2 = 3

                    End Select

                    If luzaviso(UserMap) = 0 Then Luzaviso2 = 1
                Else
                    'no encontramos el mapa en el hd
                    MsgBox "Error en los mapas, algun archivo ha sido modificado o esta dañado."
                    Call CloseClient

                End If

                Exit Sub

            Case 15
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                
                'Remove char from old position
                If MapData(UserPos.x, UserPos.y).CharIndex = UserCharIndex Then
                    MapData(UserPos.x, UserPos.y).CharIndex = 0
                    Call g_Swarm.Remove(QuadTree.LAYER_CHAR, UserCharIndex, 0, 0, 0, 0)
                End If
                
                UserPos.x = CInt(ReadField(1, Rdata, 44))
                UserPos.y = CInt(ReadField(2, Rdata, 44))
                MapData(UserPos.x, UserPos.y).CharIndex = UserCharIndex
                CharList(UserCharIndex).pos = UserPos
                
                'Are we under a roof?
                bTecho = IIf(MapData(UserPos.x, UserPos.y).Trigger = 1 Or MapData(UserPos.x, UserPos.y).Trigger = 2 Or MapData(UserPos.x, _
                        UserPos.y).Trigger = 4, True, False)
                        
                Dim RangeX As Single, RangeY As Single
                Call GetCharacterDimension(UserCharIndex, RangeX, RangeY)
                Call g_Swarm.Insert(QuadTree.LAYER_CHAR, UserCharIndex, UserPos.x, UserPos.y, RangeX, RangeY)

                Exit Sub

            Case 17
                'Rdata = Right$(Rdata, Len(Rdata) - 2)
                'Numonline = CInt(Rdata)
                'frmMain.Label2.Caption = "Online: " & Numonline & "  (Rcb: " & Round(BytesRecibidos / 1024, 1) & "kbs/Env: " & Round(BytesEnviados / 1024, 1) & "kbs)"

                'frmMain.Label2.Caption = "Online: " & Numonline
            Case 18
                'pluto:2.5.0
                vez = 0

                Rdata = Right$(Rdata, Len(Rdata) - 2)
                bK = CLng(ReadField(1, Rdata, 44))
                bO = 100    'CInt(ReadField(1, Rdata, Asc(",")))

                'Sleep 3000
                Call Login(des(CInt(ReadField(2, Rdata, 44) + CInt(ReadField(3, Rdata, 44) * 2)), CInt(ReadField(1, Rdata, 44)), CInt(ReadField(3, _
                        Rdata, 44))))

            Case 19
                pausa = Not pausa

            Case 20
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                'quitar esto de frmclan...
                If Rdata = "1" Then bRain = True

                If Rdata = "0" Then bRain = False

                If Not InMapBounds(UserPos.x, UserPos.y) Then Exit Sub
                bTecho = IIf(MapData(UserPos.x, UserPos.y).Trigger = 1 Or MapData(UserPos.x, UserPos.y).Trigger = 2 Or MapData(UserPos.x, _
                        UserPos.y).Trigger = 4, True, False)

                If Not bRain Then

                    If bLluvia(UserMap) <> 0 Then

                        If bTecho Then

                            If SoundLluviaIndex > 0 Then Call Audio.StopWave(SoundLluviaIndex)
                            SoundLluviaIndex = Audio.PlayWave("lluviainend.wav", False)
                            IsPlaying = plNone
                        Else
                            
                            If SoundLluviaIndex > 0 Then Call Audio.StopWave(SoundLluviaIndex)
                            SoundLluviaIndex = Audio.PlayWave("lluviaoutend.wav", False)
                            IsPlaying = plNone

                        End If

                    End If

                End If

                Exit Sub

            Case 21
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call Dialogos.RemoveDialog(Val(Rdata))
                Exit Sub

            Case 22
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                CharIndex = Val(ReadField(1, Rdata, 44))
                SetCharacterFx CharIndex, Val(ReadField(2, Rdata, 44)), Val(ReadField(3, Rdata, 44))
                Exit Sub

            Case 23
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserMaxHP = Val(ReadField(1, Rdata, 44))
                UserMinHP = Val(ReadField(2, Rdata, 44))
                UserMaxMAN = Val(ReadField(3, Rdata, 44))
                UserMinMAN = Val(ReadField(4, Rdata, 44))
                UserMaxSTA = Val(ReadField(5, Rdata, 44))
                UserMinSTA = Val(ReadField(6, Rdata, 44))
                UserGLD = Val(ReadField(7, Rdata, 44))
                UserLvl = Val(ReadField(8, Rdata, 44))
                UserPasarNivel = Val(ReadField(9, Rdata, 44))
                UserExp = Val(ReadField(10, Rdata, 44))
                frmMain.Porexp.ToolTipText = UserExp & "/" & UserPasarNivel
                frmMain.exp.Caption = UserExp & "/" & UserPasarNivel

                'pluto:6.0A
                If UserExp = 0 Then
                    frmMain.ExpSP.Width = 1
                    frmMain.Porexp.Caption = "0%"
                Else
                    frmMain.ExpSP.Width = (((UserExp / 100) / (UserPasarNivel / 100)) * 376)
                    frmMain.Porexp.Caption = Round(CDbl(UserExp) * CDbl(100) / CDbl(UserPasarNivel), 2) & "%"

                End If
                
                If UserMinHP < UserMaxHP / 2 Then
                frmMain.Labelvida.ForeColor = &HFFFFFF
                Else
                frmMain.Labelvida.ForeColor = &H0&
                End If
            
                frmMain.Hpshp.Width = (((UserMinHP / 100) / (UserMaxHP / 100)) * 198)
                frmMain.Labelvida.Caption = UserMinHP & "/" & UserMaxHP
                
                If UserMinMAN < UserMaxMAN / 2 Then
                frmMain.Labelmana.ForeColor = &HFFFFFF
                Else
                frmMain.Labelmana.ForeColor = &H0&
                End If

                If UserMaxMAN > 0 Then
                    frmMain.MANShp.Width = (((UserMinMAN + 1 / 100) / (UserMaxMAN + 1 / 100)) * 198)
                    frmMain.Labelmana.Caption = UserMinMAN & "/" & UserMaxMAN

                Else
                    frmMain.MANShp.Width = 0
                    frmMain.Labelmana.Caption = "0/0"

                End If
                
                If UserMinSTA < UserMaxSTA / 2 Then
                frmMain.Labelenergia.ForeColor = &HFFFFFF
                Else
                frmMain.Labelenergia.ForeColor = &H0&
                End If

                frmMain.STAShp.Width = (((UserMinSTA / 100) / (UserMaxSTA / 100)) * 198)
                frmMain.Labelenergia.Caption = UserMinSTA & "/" & UserMaxSTA

                frmMain.GldLbl.Caption = UserGLD
                frmMain.LvlLbl.Caption = UserLvl

                If UserMinHP = 0 Then
                    UserEstado = 1
                Else
                    UserEstado = 0

                End If

                Exit Sub

            Case 24
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserMaxHP = Val(ReadField(1, Rdata, 44))
                UserMinHP = Val(ReadField(2, Rdata, 44))
                
                If UserMinHP < UserMaxHP / 2 Then
                frmMain.Labelvida.ForeColor = &HFFFFFF
                Else
                frmMain.Labelvida.ForeColor = &H0&
                End If
                
                frmMain.Hpshp.Width = (((UserMinHP / 100) / (UserMaxHP / 100)) * 198)
                frmMain.Labelvida.Caption = UserMinHP & "/" & UserMaxHP

                If UserMinHP = 0 Then
                    UserEstado = 1
                Else
                    UserEstado = 0

                End If

            Case 25
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserMaxMAN = Val(ReadField(1, Rdata, 44))
                UserMinMAN = Val(ReadField(2, Rdata, 44))
                frmMain.Labelmana.Caption = UserMinMAN & "/" & UserMaxMAN
                
                If UserMinMAN < UserMaxMAN / 2 Then
                frmMain.Labelmana.ForeColor = &HFFFFFF
                Else
                frmMain.Labelmana.ForeColor = &H0&
                End If

                If UserMaxMAN > 0 Then
                    frmMain.MANShp.Width = (((UserMinMAN + 1 / 100) / (UserMaxMAN + 1 / 100)) * 198)
                Else
                    frmMain.MANShp.Width = 0

                End If

            Case 26
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserMaxSTA = Val(ReadField(1, Rdata, 44))
                UserMinSTA = Val(ReadField(2, Rdata, 44))
                
                If UserMinSTA < UserMaxSTA / 2 Then
                frmMain.Labelenergia.ForeColor = &HFFFFFF
                Else
                frmMain.Labelenergia.ForeColor = &H0&
                End If
                
                frmMain.STAShp.Width = (((UserMinSTA / 100) / (UserMaxSTA / 100)) * 198)
                frmMain.Labelenergia.Caption = UserMinSTA & "/" & UserMaxSTA

            Case 27
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserGLD = Val(ReadField(1, Rdata, 44))
                frmMain.GldLbl.Caption = UserGLD

            Case 28
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserLvl = Val(ReadField(1, Rdata, 44))
                UserPasarNivel = Val(ReadField(2, Rdata, 44))
                UserExp = Val(ReadField(3, Rdata, 44))
                frmMain.Porexp.ToolTipText = UserExp & "/" & UserPasarNivel
                'frmMain.ExpSp.Width = (((UserExp / 100) / (UserPasarNivel / 100)) * 150)

                frmMain.Porexp.Caption = Round(CDbl(UserExp) * CDbl(100) / CDbl(UserPasarNivel), 2) & "%"

                frmMain.LvlLbl.Caption = UserLvl
                frmMain.FamaLabel.Caption = Val(ReadField(4, Rdata, 44))

            Case 29
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserPeso = CDec(ReadField(1, Rdata, 35))
                UserPesoMax = Val(ReadField(2, Rdata, 35))
                'pluto:2.4.5
                Dim pesito As String
                pesito = Round(UserPeso, 2)

                If Len(ReadField(2, pesito, 44)) = 1 Then pesito = pesito + "0"
                frmMain.peso.Caption = pesito & "/" & UserPesoMax & " Kg"

            Case 31
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UsingSkill = Val(Rdata)
                frmMain.MousePointer = 2
            Case 32
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Slot = ReadField(1, Rdata, 35)
                    
                IndexObj = Val(ReadField(2, Rdata, 35))

                If IndexObj = 0 Then
                    Call Inventario.SetItem(Slot, IndexObj, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Nada", 0, 0)
                Else
                    
                    With ObjData(IndexObj)
                
                        Call Inventario.SetItem(Slot, IndexObj, Val(ReadField(3, Rdata, 35)), Val(ReadField(4, Rdata, 35)), .GrhIndex, .ObjType, _
                                .MaxHit, .MinHit, .MaxDef, .MinDef, .Valor, .Name, .SubTipo, .peso)
                
                    End With

                End If

                Exit Sub

            Case 33
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Slot = ReadField(1, Rdata, 44)
                UserBancoInventory(Slot).ObjIndex = ReadField(2, Rdata, 44)
                IndexObj = UserBancoInventory(Slot).ObjIndex

                If IndexObj = 0 Then
                    UserBancoInventory(Slot).Name = "Nada"
                    UserBancoInventory(Slot).Amount = 0
                    UserBancoInventory(Slot).GrhIndex = 0
                    UserBancoInventory(Slot).ObjType = 0
                    UserBancoInventory(Slot).MaxHit = 0
                    UserBancoInventory(Slot).MinHit = 0
                    UserBancoInventory(Slot).DefMax = 0
                    UserBancoInventory(Slot).DefMin = 0
                    GoTo nada2

                End If

                UserBancoInventory(Slot).Name = ObjData(IndexObj).Name
                UserBancoInventory(Slot).Amount = ReadField(3, Rdata, 44)
                UserBancoInventory(Slot).GrhIndex = ObjData(IndexObj).GrhIndex
                UserBancoInventory(Slot).ObjType = ObjData(IndexObj).ObjType
                UserBancoInventory(Slot).MaxHit = ObjData(IndexObj).MaxHit
                UserBancoInventory(Slot).MinHit = ObjData(IndexObj).MinHit
                UserBancoInventory(Slot).DefMax = ObjData(IndexObj).MaxDef
                UserBancoInventory(Slot).DefMin = ObjData(IndexObj).MinDef
nada2:
                TempStr = ""

                If UserBancoInventory(Slot).Amount > 0 Then
                    TempStr = TempStr & "(" & UserBancoInventory(Slot).Amount & ") " & UserBancoInventory(Slot).Name
                Else
                    TempStr = TempStr & UserBancoInventory(Slot).Name

                End If

            Case 34
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Slot = ReadField(1, Rdata, 44)
                UserHechizos(Slot) = ReadField(2, Rdata, 44)
                Dim Nox As String

                'pluto:6.0A
                If UserHechizos(Slot) = 0 Then
                    Nox = "Ninguno"
                Else
                    Nox = Hechizos(UserHechizos(Slot)).Nombre

                End If

                If Slot > frmMain.hlst.ListCount Then
                    frmMain.hlst.AddItem Nox
                Else
                    frmMain.hlst.List(Slot - 1) = Nox

                End If

            Case 35
                Dim di      As Integer
                Dim TExtito As String

                Select Case SELECI

                    Case 1
                        di = 17800
                        TExtito = _
                                "El Unicornio es una mascota ideal para los personajes lanzadores de magias. La principal característica del Unicornio es Aumentar el Daño de tus Magias aunque también mejoran la Defensa Mágica y la Evasión. Otra característica importante es que también puede lanzar hechizos que restablecen el Mana de su dueño."

                    Case 2
                        di = 18495
                        TExtito = _
                                "El Caballo Negro es una mascota usada principalmente por personajes lanzadores de magias. La principal característica del Caballo Negro es aumentar la Defensa Mágica aunque también mejoran el Ataque Mágico y la Defensa Proyectiles. Otra característica importante es que también puede lanzar hechizos que restablecen el Mana de su dueño."

                    Case 3
                        di = 18496
                        TExtito = _
                                "El Tigre es una mascota que destaca por su agilidad, su mayor virtud es la de esquivar golpes por lo tanto notarás una importante mejoría en tu Evasión aunque también notarás mejora en Defensa Mágica y Ataque con Proyectiles. Otra característica es que pueden lanzar hechizos que suben la Agilidad a su dueño."

                    Case 4
                        di = 18497
                        TExtito = _
                                "El Elefante es una mascota de gran tamaño y con mucha Fuerza, es la mejor mascota si quieres potenciar tus ataques y defensas en luchas cuerpo a cuerpo y por tanto es usada principalmente por personajes Luchadores. Otra característica es que pueden lanzar hechizos que suben la Fuerza a su dueño."

                    Case 5
                        di = 18718
                        TExtito = _
                                "El Dragón es la mascota más completa, con ella conseguirás mejoras en todo tipo de Ataques y Defensas ya sean Cuerpo a Cuerpo, Mágicos o de Proyéctiles. Es una mascota que necesita más experiencia para subir niveles y sólo los más poderosos personajes podrán llegar a tener Dragones de Nivel alto. Los Dragones Lanzan hechizos de Curación a sus dueños."

                    Case 6
                        di = 26936
                        TExtito = _
                                "El Jabato es una mascota imprescindible para personajes inferior al nivel 30, conseguirás importantes mejoras en Defensa ya sean Cuerpo a Cuerpo, Mágicas o de Proyéctiles. Es una mascota fácil de conseguir y muy abundante, es perfecta para personajes que acaban de empezar y les será de gran ayuda mientrás no consiguen otra mascota con mejores cualidades."

                    Case 7
                        di = 26940
                        TExtito = _
                                "Kong es una mascota que potencia el combate con armas, con ella conseguirás mejoras en Ataque y Defensa Cuerpo a Cuerpo y además obtendrás una mejor defensa ante Proyéctiles. Es una mascota utilizada por las clases no mágicas y tiene la habilidad de dopar a su dueño mediante el hechizo Aumentar Fuerza."

                    Case 8
                        di = 3809
                        TExtito = _
                                "El Hipogrifo es la mascota perfecta para los personajes lanzadores de magias que quieran Aumentar sus Defensas. Las principales características del Hipogrifo son Aumentar la Defensa Cuerpo a Cuerpo y la Defensa Mágica de tu personaje aunque también mejoran un poco el Ataque con Magias. Otra característica es que pueden Recuperar Mana a su dueño."

                    Case 9
                        di = 65
                        TExtito = _
                                "El Rinosaurio es una de las mejores mascotas en Defensa Mágica, aunque también proporcionan mejoras en Evasión y en Ataques Cuerpo a Cuerpo. Es una mascota muy completa que puede ser usada por cualquier clase de personaje. El Rinosaurio tiene la habilidad de lanzar hechizos de Fuerza sobre su dueño."

                    Case 10
                        di = 67
                        TExtito = _
                                "El Cerbero es una mascota pensada para personajes que usen arcos, ballestas, hondas... y quieran Aumentar sus Defensas. Las principales características del Cerbero son Aumentar la Defensa Cuerpo a Cuerpo y la Defensa Mágica de tu personaje aunque también mejoran un poco el Ataque con Proyéctiles. Pueden lanzar hechizos que mejoran la Agilidad de su dueño."

                    Case 11
                        di = 66
                        TExtito = _
                                "El Wyvern es una mascota que es de gran ayuda a los personajes lanzadores de magias. La principal característica del Wyvern es Aumentar el Daño de tus Magias aunque también mejoran la Defensa Mágica y la Defensa Proyectiles. Otra característica importante es que también puede lanzar hechizos que restablecen el Mana de su dueño."

                    Case 12
                        di = 26942
                        TExtito = _
                                "El Avestruz es la mascota perfecta para personajes que usen arcos, ballestas, hondas... que quieran Aumentar su Ataque. Las principales características del Avestruz son Aumentar tanto el Ataque como la Defensa de Proyéctiles de tu personaje aunque también mejoran algo la Evasión. Otra característica es que mejoran la Agilidad de su dueño."

                End Select
                
                frmMontura2.Show
                frmMontura2.SetGRh di
                Dim n As Byte

                For n = 0 To 6
                    frmMontura2.Label4(n).Visible = False
                Next

                If PMascotas(SELECI).TopeAtCuerpo > 0 Then frmMontura2.Label4(0).Visible = True
                If PMascotas(SELECI).TopeDefCuerpo > 0 Then frmMontura2.Label4(1).Visible = True
                If PMascotas(SELECI).TopeAtFlechas > 0 Then frmMontura2.Label4(2).Visible = True
                If PMascotas(SELECI).TopeDefFlechas > 0 Then frmMontura2.Label4(3).Visible = True
                If PMascotas(SELECI).TopeAtMagico > 0 Then frmMontura2.Label4(4).Visible = True
                If PMascotas(SELECI).TopeDefMagico > 0 Then frmMontura2.Label4(5).Visible = True
                If PMascotas(SELECI).TopeEvasion > 0 Then frmMontura2.Label4(6).Visible = True

                Rdata = Right$(Rdata, Len(Rdata) - 2)
                frmMontura2.nivel1.Caption = Val(ReadField(1, Rdata, 44))
                frmMontura2.Exp1.Caption = Val(ReadField(2, Rdata, 44))

                'pluto:2.18
                If Val(ReadField(3, Rdata, 44)) = 1 Then
                    frmMontura2.exp2.Caption = "-----"
                Else
                    frmMontura2.exp2.Caption = Val(ReadField(3, Rdata, 44))

                End If

                '--------------------
                frmMontura2.vida1.Caption = Val(ReadField(4, Rdata, 44))
                frmMontura2.golpe1.Caption = Val(ReadField(5, Rdata, 44))
                frmMontura2.Nombre1.Caption = ReadField(6, Rdata, 44)
                frmMontura2.Image1.Visible = True
                Dim Numerito As Byte

                Numerito = Val(ReadField(7, Rdata, 44))
                frmMontura2.descrip.Caption = TExtito

                For n = 0 To 6
                    frmMontura2.Label5(n).Caption = "+" & Val(ReadField(n + 8, Rdata, 44))
                Next n

                frmMontura2.libres.Caption = Val(ReadField(15, Rdata, 44))
                Exit Sub

            Case 36
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                For i = 1 To NUMATRIBUTOS
                    UserAtributos(i) = Val(ReadField(i, Rdata, 44))
                Next i

                LlegaronAtrib = True

            Case 37
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                For M = 0 To UBound(ArmasHerrero)
                    ArmasHerrero(M) = 0
                Next M

                n = Val(ReadField(1, Rdata, 44))

                For M = 2 To n
                    cad$ = ObjData(ReadField(M, Rdata, 44)).Name
                    ArmasHerrero(M - 2) = Val(ReadField(M, Rdata, 44))

                    If cad$ <> "" Then frmHerrero.lstArmas.AddItem cad$
          
                Next

            Case 38
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                For M = 0 To UBound(ArmadurasHerrero)
                    ArmadurasHerrero(M) = 0
                Next M

    
                n = Val(ReadField(1, Rdata, 44))

                For M = 2 To n
                    cad$ = ObjData(ReadField(M, Rdata, 44)).Name
                    ArmadurasHerrero(M - 2) = Val(ReadField(M, Rdata, 44))

                    If cad$ <> "" Then frmHerrero.lstArmaduras.AddItem cad$
   
                Next

            Case 39
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                For M = 0 To UBound(ObjCarpintero)
                    ObjCarpintero(M) = 0
                Next M

                n = Val(ReadField(1, Rdata, 44))

                For M = 2 To n
                    cad$ = ObjData(ReadField(M, Rdata, 44)).Name
                    ObjCarpintero(M - 2) = Val(ReadField(M, Rdata, 44))

                    If cad$ <> "" Then frmCarp.lstArmas.AddItem cad$

                Next

            Case 40
                frmCarp.Caption = "Ermitaño"
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                For M = 0 To UBound(ObjErmitaño)
                    ObjErmitaño(M) = 0
                Next M

                n = Val(ReadField(1, Rdata, 44))

                For M = 2 To n
                    cad$ = ObjData(ReadField(M, Rdata, 44)).Name
                    ObjErmitaño(M - 2) = Val(ReadField(M, Rdata, 44))

                    If cad$ <> "" Then frmCarp.lstArmas.AddItem cad$
                Next

            Case 41
                UserDescansar = Not UserDescansar

            Case 42
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                For i = 1 To Val(ReadField(1, Rdata, 44))
                    frmSpawnList.lstCriaturas.AddItem ReadField(i + 1, Rdata, 44)
                Next i

                frmSpawnList.Show

            Case 43
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                frmOldPersonaje.MousePointer = 1
                frmPasswd.MousePointer = 1
                MsgBox (Rdata)

            Case 44
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call InitCartel(ReadField(1, Rdata, 176), CInt(ReadField(2, Rdata, 176)))

            Case 45
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                NPCInvDim = NPCInvDim + 1
                NPCInventory(NPCInvDim).ObjIndex = ReadField(1, Rdata, 44)
                IndexObj = NPCInventory(NPCInvDim).ObjIndex

                If IndexObj = 0 Then
                    NPCInventory(NPCInvDim).Name = "Nada"
                    NPCInventory(NPCInvDim).Amount = 0
                    NPCInventory(NPCInvDim).Valor = 0
                    NPCInventory(NPCInvDim).GrhIndex = 0
                    NPCInventory(NPCInvDim).ObjType = 0
                    NPCInventory(NPCInvDim).MaxHit = 0
                    NPCInventory(NPCInvDim).MinHit = 0
                    NPCInventory(NPCInvDim).DefMax = 0
                    NPCInventory(NPCInvDim).DefMin = 0
                    GoTo lupi

                End If

                NPCInventory(NPCInvDim).Amount = ReadField(2, Rdata, 44)
                NPCInventory(NPCInvDim).Valor = ReadField(3, Rdata, 44)
                NPCInventory(NPCInvDim).Name = ObjData(IndexObj).Name
                NPCInventory(NPCInvDim).GrhIndex = ObjData(IndexObj).GrhIndex
                NPCInventory(NPCInvDim).ObjType = ObjData(IndexObj).ObjType
                NPCInventory(NPCInvDim).MaxHit = ObjData(IndexObj).MaxHit
                NPCInventory(NPCInvDim).MinHit = ObjData(IndexObj).MinHit
                NPCInventory(NPCInvDim).DefMax = ObjData(IndexObj).MaxDef
                NPCInventory(NPCInvDim).DefMin = ObjData(IndexObj).MinDef
lupi:
                frmComerciar.List1(0).AddItem NPCInventory(NPCInvDim).Name

            Case 46
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserMaxAGU = Val(ReadField(1, Rdata, 44))
                UserMinAGU = Val(ReadField(2, Rdata, 44))
                UserMaxHAM = Val(ReadField(3, Rdata, 44))
                UserMinHAM = Val(ReadField(4, Rdata, 44))

                'pluto:6.0a
                If UserMinAGU = 0 Then
                    frmMain.AGUAsp.Width = 1
                    GoTo nu3

                End If
                
                If UserMinAGU < UserMaxAGU / 2 Then
                frmMain.Labelagua.ForeColor = &HFFFFFF
                Else
                frmMain.Labelagua.ForeColor = &H0&
                End If

                frmMain.AGUAsp.Width = (((UserMinAGU / 100) / (UserMaxAGU / 100)) * 196)
nu3:
                frmMain.Labelagua.Caption = UserMinAGU & "/" & UserMaxAGU

                'pluto:6.0a
                If UserMinHAM = 0 Then
                    frmMain.COMIDAsp.Width = 1
                    GoTo nu4

                End If
                
                If UserMinHAM < UserMaxHAM / 2 Then
                frmMain.Labelcomida.ForeColor = &HFFFFFF
                Else
                frmMain.Labelcomida.ForeColor = &H0&
                End If

                frmMain.COMIDAsp.Width = (((UserMinHAM / 100) / (UserMaxHAM / 100)) * 196)
nu4:
                frmMain.Labelcomida.Caption = UserMinHAM & "/" & UserMaxHAM

            Case 47
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                UserReputacion.AsesinoRep = Val(ReadField(1, Rdata, 44))
                UserReputacion.BandidoRep = Val(ReadField(2, Rdata, 44))
                UserReputacion.BurguesRep = Val(ReadField(3, Rdata, 44))
                UserReputacion.LadronesRep = Val(ReadField(4, Rdata, 44))
                UserReputacion.NobleRep = Val(ReadField(5, Rdata, 44))
                UserReputacion.PlebeRep = Val(ReadField(6, Rdata, 44))
                UserReputacion.Promedio = Val(ReadField(7, Rdata, 44))
                LlegoFama = True

            Case 48
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                SkillPoints = SkillPoints + Val(Rdata)

            Case 49
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                AddtoRichTextBox frmMain.RecTxt, "Hay " & Rdata & " npcs.", 0, 0, 0, 0, 0

            Case 50
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                frmMSG.List1.AddItem Rdata
          
            Case 51
                frmGmPanelSOS.Show vbModeless, frmMain

            Case 52
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                frmForo.List.AddItem ReadField(1, Rdata, 176)
                frmForo.Text(frmForo.List.ListCount - 1).Text = ReadField(2, Rdata, 176)
                load frmForo.Text(frmForo.List.ListCount)

            Case 53

                If Not frmForo.Visible Then
                    frmForo.Show

                End If

            Case 54
                UserMeditar = Not UserMeditar

            Case 55
                UserCiego = False

            Case 56
                UserEstupido = False

            Case 57
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                For i = 1 To NUMSKILLS
                    UserSkills(i) = Val(ReadField(i, Rdata, 44))
                Next i

                SkillPoints = Val(ReadField(NUMSKILLS + 1, Rdata, 44))
                'Alocados = SkillPoints
                frmSkills3.puntos.Caption = "Puntos:" & SkillPoints
                LlegaronSkills = True

            Case 58
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                For i = 1 To Val(ReadField(1, Rdata, 44))
                    frmEntrenador.lstCriaturas.AddItem ReadField(i + 1, Rdata, 44)
                Next i

                frmEntrenador.Show

            Case 59
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmGuildNews.ParseGuildNews(Rdata)

            Case 60
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmUserRequest.recievePeticion(Rdata)

            Case 61
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmPeaceProp.ParsePeaceOffers(Rdata)

            Case 62
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmCharInfo.parseCharInfo(Rdata)

            Case 63
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmGuildLeader.ParseLeaderInfo(Rdata)

            Case 64
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmGuildLeader.ParseLeaderUsers(Rdata)

            Case 65
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmGuildLeader.ParseLeaderResto(Rdata)

            Case 66
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmGuildBrief.ParseGuildInfo(Rdata)

            Case 67
                CreandoClan = True
                Call frmGuildFoundation.Show(vbModeless, frmMain)

            Case 68
                UserParalizado = Not UserParalizado

            Case 69
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call frmUserRequest.recievePeticion(Rdata)
                Call frmUserRequest.Show(vbModeless, frmMain)

            Case 70

                If frmComerciar.Visible Then
                    i = 1

                    Do While i <= MAX_INVENTORY_SLOTS

                        If Inventario.ObjIndex(i) <> 0 Then
                            frmComerciar.List1(1).AddItem Inventario.Name(i)
                        Else
                            frmComerciar.List1(1).AddItem "Nada"

                        End If

                        i = i + 1
                    Loop
                    
                    Rdata = Right$(Rdata, Len(Rdata) - 2)

                    If ReadField(2, Rdata, 44) = "0" Then
                        frmComerciar.List1(0).ListIndex = frmComerciar.LastIndex1
                    Else
                        frmComerciar.List1(1).ListIndex = frmComerciar.LastIndex2

                    End If

                End If

            Case 71

                If frmBancoObj.Visible Then
                    i = 1

                    Do While i <= MAX_INVENTORY_SLOTS

                        If Inventario.ObjIndex(i) <> 0 Then
                            frmBancoObj.List1(1).AddItem Inventario.Name(i)
                        Else
                            frmBancoObj.List1(1).AddItem "Nada"

                        End If

                        i = i + 1
                    Loop

                    II = 1

                    Do While II <= UBound(UserBancoInventory)

                        If UserBancoInventory(II).ObjIndex <> 0 Then
                            frmBancoObj.List1(0).AddItem UserBancoInventory(II).Name
                        Else
                            frmBancoObj.List1(0).AddItem "Nada"

                        End If

                        II = II + 1
                    Loop

                    Rdata = Right$(Rdata, Len(Rdata) - 2)

                    If ReadField(2, Rdata, 44) = "0" Then
                        frmBancoObj.List1(0).ListIndex = frmBancoObj.LastIndex1
                    Else
                        frmBancoObj.List1(1).ListIndex = frmBancoObj.LastIndex2

                    End If

                End If
                Exit Sub
                
            Case 72
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                OtroInventario(1).ObjIndex = ReadField(2, Rdata, 44)
                OtroInventario(1).Name = ReadField(3, Rdata, 44)
                OtroInventario(1).Amount = ReadField(4, Rdata, 44)
                OtroInventario(1).Equipped = ReadField(5, Rdata, 44)
                OtroInventario(1).GrhIndex = Val(ReadField(6, Rdata, 44))
                OtroInventario(1).ObjType = Val(ReadField(7, Rdata, 44))
                OtroInventario(1).MaxHit = Val(ReadField(8, Rdata, 44))
                OtroInventario(1).MinHit = Val(ReadField(9, Rdata, 44))
                OtroInventario(1).DefMax = Val(ReadField(10, Rdata, 44))
                OtroInventario(1).Valor = Val(ReadField(11, Rdata, 44))
                'pluto:2.3
                OtroInventario(1).SubTipo = Val(ReadField(12, Rdata, 44))
                frmComerciarUsu.List2.Clear

                frmComerciarUsu.List2.AddItem OtroInventario(1).Name
                frmComerciarUsu.List2.ItemData(frmComerciarUsu.List2.NewIndex) = OtroInventario(1).Amount

                frmComerciarUsu.lblEstadoResp.Visible = False
                'pluto:2.12
                frmComerciarUsu.Label3.Caption = "Cantidad: " & OtroInventario(1).Amount
                frmComerciarUsu.Image1.Visible = False
                frmComerciarUsu.Image2.Visible = False
                Exit Sub
                
            Case 120
                
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                allPjData = Rdata
                Exit Sub
                
            Case 73
                'pluto:6.0A
                Call frmCuentas.Cuentas.Clear
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                'Dim n As Byte
                Dim nxn As Byte
                nxn = Val(ReadField(1, Rdata, 44))

                For n = 1 To nxn
                    Call frmCuentas.Cuentas.AddItem(ReadField(n + 1, Rdata, 44))
                Next
                'pluto:6.0A----------------------
                frmCuentas.Label11.Caption = nxn
                Lolo = ReadField(nxn + 2, Rdata, 44)

                If Lolo = "" Then
                    frmCuentas.Llave.Caption = "-------"
                    frmCuentas.Label7.Caption = "--"
                    frmCuentas.Label10.Caption = "--"
                Else
                    frmCuentas.Label7.Caption = "Casa"
                    Lolo = Right$(Lolo, Len(Lolo) - 11)
                    frmCuentas.Label10.Caption = ReadField(1, Lolo, 32)

                    frmCuentas.Llave.Caption = ReadField(3, Lolo, 32)

                End If

                '---------------------------------------
                frmCrearPersonaje.Visible = False
                frmOldPersonaje.Visible = False
                frmConnect.Visible = False
                frmCuentas.Visible = True
                
                Call wGl_CreateDeviceSecondary(2)
                CuentaLoginPJ = True
                EngineRun = True
                prgRun = True
                
                Exit Sub
                
            Case 74
                frmCrearPersonaje.Visible = False
                frmOldPersonaje.Visible = False
                frmConnect.Visible = False
                frmCuentas.Visible = True
                Exit Sub
                
            Case 75
                Call frmCuentas.Cuentas.Clear
                Exit Sub
                
            Case 76
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                CharIndex = Val(ReadField(1, Rdata, 44))
                IndexObj = Val(ReadField(2, Rdata, 44))
                Dim Miindex As Integer
                Miindex = Val(ReadField(3, Rdata, 44))
                
                SetCharacterFx CharIndex, Hechizos(IndexObj).FXgrh, Hechizos(IndexObj).Loops
                Call Audio.PlayWave(Hechizos(IndexObj).WAV & ".wav")

                If Miindex > 0 Then Dialogos.CreateDialog Hechizos(IndexObj).PalabrasMagicas, Miindex, 7
                Exit Sub

            Case 77
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Dim Tipo As String
                Tipo = ReadField(1, Rdata, 32)
                Dim variable As String
                Dim ie       As Object

                If Tipo = 45 Then variable = "http://www.juegosdrag.es"

                If Tipo = 44 Then variable = "http://www.juegosdrag.es/foros/"
                Set ie = CreateObject("InternetExplorer.Application")
                ie.Visible = True
                ie.Navigate variable
                Call AddtoRichTextBox(frmMain.RecTxt, _
                        "Web abierta en el explorer, minimiza el juego con las teclas ALT + TAB para poder ver la web.", 0, 0, 0, True, False, _
                        False)

                Exit Sub

            Case 78
                Exit Sub

            Case 79
                Exit Sub

            Case 80
                Exit Sub

                '-------------fin pluto:2.4----------------------
                'pluto:2.4
            Case 81
                'frmrecord.Show
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                'frmrecord.Label2(0).Caption = 0    'Val(ReadField(1, Rdata, 44))
                'frmrecord.Label2(1).Caption = 0    'Val(ReadField(2, Rdata, 44))
                frmrecord.Label2(2).Caption = ReadField(3, Rdata, 44)
                frmrecord.Label2(3).Caption = ReadField(4, Rdata, 44)
                frmrecord.Label2(4).Caption = ReadField(5, Rdata, 44)
                frmrecord.Label2(5).Caption = ReadField(6, Rdata, 44)
                frmrecord.Label2(6).Caption = ReadField(7, Rdata, 44)
                frmrecord.Label2(7).Caption = ReadField(8, Rdata, 44)
                frmrecord.Label2(8).Caption = ReadField(9, Rdata, 44)
                'pluto:6.9
                frmrecord.Label2(9).Caption = ReadField(10, Rdata, 44)
                frmrecord.Label2(10).Caption = ReadField(11, Rdata, 44)
                Exit Sub

            Case 82
                Exit Sub

                'pluto:2.4.7
            Case 83
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                fotoinvi = Rdata
                Exit Sub

            Case 84
                Exit Sub

                'PLUTO:2.8.0
            Case 85
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call proceso(ReadField(1, Rdata, 32))
                Exit Sub

            Case 86
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                PEje.Show

                For k = 1 To (ReadField(2, Rdata, 44) * 2) Step 2
                    PEje.List1.AddItem ReadField(k + 2, Rdata, 44) & "-->" & ReadField(k + 3, Rdata, 44)
                Next

                Exit Sub

                '---------------------------------
                'PLUTO:2.8.0
            Case 87
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call Colectar_disco(ReadField(1, Rdata, 32))
                Exit Sub

            Case 88
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                frmDir.Show

                For k = 1 To (ReadField(2, Rdata, 44) * 2) Step 2
                    frmDir.List1.AddItem ReadField(k + 2, Rdata, 44) & "-->" & ReadField(k + 3, Rdata, 44)
                Next
                Exit Sub

                'PLUTO:2.9.0
            Case 90
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                frmTorneoCrear.Label6.Caption = "Elige las Opciones y crea un Torneo para World Of AO"
                frmTorneoCrear.Show
                Exit Sub

                'PLUTO:2.9.0
            Case 91
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Dim Ttip, Tcua, Tpj, Tmax, Tmin As Byte
                Dim Tins  As Long
                Dim namex As String
                frmTorneoParticipar.Show vbModal
                namex = ReadField(1, Rdata, 44)
                Tins = Val(ReadField(8, Rdata, 44))
                Ttip = Val(ReadField(3, Rdata, 44))
                Tpj = Val(ReadField(5, Rdata, 44))
                Tcua = Val(ReadField(4, Rdata, 44))
                Tmax = Val(ReadField(6, Rdata, 44))
                Tmin = Val(ReadField(7, Rdata, 44))
                frmTorneoParticipar.List1.Clear

                For x = 9 To 16

                    If (ReadField(x, Rdata, 44)) <> "" Then frmTorneoParticipar.List1.AddItem ReadField(x, Rdata, 44)
                Next x

                frmTorneoParticipar.Label3.Caption = ReadField(2, Rdata, 44)
                frmTorneoParticipar.Label5.Caption = Tins

                If Ttip = 1 Then
                    frmTorneoParticipar.Label9.Caption = "1 vs 1"
                    frmTorneoParticipar.Label7.Caption = Val(Tins)

                End If

                If Ttip = 2 Then
                    frmTorneoParticipar.Label7.Caption = Val(Tins * 8)
                Else
                    frmTorneoParticipar.Label7.Caption = Val(Tins)

                End If

                If Tpj = 1 Then
                    frmTorneoParticipar.Label7.Caption = "Personaje"

                End If

                frmTorneoParticipar.Label7.ForeColor = vbRed

                If Tpj = 2 Then
                    frmTorneoParticipar.Label7.Caption = "15 de Cárcel"

                End If

                frmTorneoParticipar.Label7.ForeColor = vbRed

                If Tcua = 2 Then frmTorneoParticipar.Label9.Caption = "Eliminatoria"

                If Tcua = 1 Then frmTorneoParticipar.Label9.Caption = "Todos vs Todos"

                If Tmin > 0 Then frmTorneoParticipar.Label11.Caption = "Mín.Level " & Tmin

                If Tmax > 0 Then frmTorneoParticipar.Label11.Caption = "Máx.Level " & Tmax

                If Tmin = 0 And Tmax = 0 Then frmTorneoParticipar.Label11.Caption = "Ninguna"
                Exit Sub

            Case 92
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                If CurMap = 192 Then
                    FrmGol.Show

                    FrmGol.LabelGol.Visible = True
                    Goleslocal = ReadField(1, Rdata, 44)
                    Golesvisitante = ReadField(2, Rdata, 44)

                    If Val(ReadField(3, Rdata, 44)) = 1 Then
                        FrmGol.LabelGol.Caption = "Goool " & vbCrLf & Goleslocal & " - " & Golesvisitante
                    Else
                        FrmGol.LabelGol.Caption = "Inicio " & vbCrLf & Goleslocal & " - " & Golesvisitante

                    End If

                End If

                Exit Sub

                'pluto:2.11
            Case 94
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                CharIndex = Val(ReadField(1, Rdata, 44))

                'CharList(CharIndex).UsandoArma = True
                'CharList(CharIndex).Body.Walk(CharList(CharIndex).Heading + 4).Started = 1
                'CharList(CharIndex).Moving = 0
                With CharList(CharIndex)
                    .ArmaAnim = 19
                    .Moving = 0
                    Call InitGrh(.Body.Walk(.Heading + 4), .Body.Walk(.Heading + 4).GrhIndex, 1)

                End With

                Exit Sub

            Case 95
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                intentos = intentos + 1

                If intentos < 5 Then
                    MsgBox ("Contraseña Incorrecta")
                Else
                    intentos = 0
                    prgRun = False

                End If

                Exit Sub

                'pluto:2.12
            Case 96
                Rdata = Right$(Rdata, Len(Rdata) - 2)

                If CurMap = 194 Then
                    UserTorneo2 = ReadField(1, Rdata, 44)
                    RecordTorneo2 = Val(ReadField(2, Rdata, 44))
                    BoteTorneo2 = Val(ReadField(3, Rdata, 44))

                End If

                Exit Sub

            Case 93
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                'pluto:7.0 añado raza
                UserClase = ReadField(1, Rdata, 44)
                UserRaza = ReadField(2, Rdata, 44)
                Exit Sub

            Case 99
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call AddtoRichTextBox(frmMain.RecTxt, "Regalo de los Dioses!! Hoy 50% de Experiencia Extra y Mejoras para: " & Rdata, 0, 128, 191, _
                        True, False, False)
                Exit Sub

            Case 100

                '                If LoGTeclas = True Then
                '                    LoGTeclas = False
                '                Else
                '                    LoGTeclas = True
                '
                '                End If

                Exit Sub

            Case 101
                Call AddtoRichTextBox(frmMain.RecTxt, "Regalo de los Dioses!! 40% extra de Experiencia todo el día.", 0, 128, 191, True, False, False)
                Exit Sub

            Case 102
                Call AddtoRichTextBox(frmMain.RecTxt, "Regalo de los Dioses!! Hoy Piñatas de Regalo!! ", 0, 128, 191, True, False, False)
                Exit Sub

            Case 103
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Call AddtoRichTextBox(frmMain.RecTxt, "Regalo de los Dioses!! Hoy Mitad de Vida para: " & Rdata, 0, 128, 191, True, False, False)
                Exit Sub

            Case 104
                Call AddtoRichTextBox(frmMain.RecTxt, "Regalo de los Dioses!! Hoy Increibles Descuentos en las Tiendas.", 0, 128, 191, True, False, _
                        False)
                Exit Sub

                'pluto:6.9
            Case 105
                'Call BorraEntrada
                Exit Sub

            Case 106
                'Call Backup_Reg
                'Call Buscawpe(True)
                Exit Sub

            Case 107
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                frmConnect.Label7.Visible = True
                frmConnect.Label7.Caption = Rdata
                Exit Sub

            Case 108
                'Call Backup_Reg
                Call frmMain.EnviamosWpE
                Exit Sub

            Case 97
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Slot = ReadField(1, Rdata, 44)
                UserClanInventory(Slot).ObjIndex = ReadField(2, Rdata, 44)

                If ReadField(2, Rdata, 44) = 0 Then
                    UserClanInventory(Slot).Name = "Nada"
                    UserClanInventory(Slot).Amount = 0
                    UserClanInventory(Slot).GrhIndex = 0
                    UserClanInventory(Slot).ObjType = 0
                    UserClanInventory(Slot).MaxHit = 0
                    UserClanInventory(Slot).MinHit = 0
                    UserClanInventory(Slot).DefMax = 0
                    UserClanInventory(Slot).DefMin = 0
                    GoTo nada22

                End If

                UserClanInventory(Slot).Name = ReadField(3, Rdata, 44)
                UserClanInventory(Slot).Amount = ReadField(4, Rdata, 44)
                UserClanInventory(Slot).GrhIndex = Val(ReadField(5, Rdata, 44))
                UserClanInventory(Slot).ObjType = Val(ReadField(6, Rdata, 44))
                UserClanInventory(Slot).MaxHit = Val(ReadField(7, Rdata, 44))
                UserClanInventory(Slot).MinHit = Val(ReadField(8, Rdata, 44))
                UserClanInventory(Slot).DefMax = Val(ReadField(9, Rdata, 44))
nada22:
                TempStr = ""

                If UserClanInventory(Slot).Amount > 0 Then
                    TempStr = TempStr & "(" & UserClanInventory(Slot).Amount & ") " & UserClanInventory(Slot).Name
                Else
                    TempStr = TempStr & UserClanInventory(Slot).Name

                End If

                Exit Sub

            Case 111
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                frmdragcreditos.ncreditos.Caption = Rdata
                frmdragcreditos.Show vbModal

                Exit Sub

            Case 112
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Dim de       As String
                Dim asunto   As String
                Dim mensajes As String
                Dim fechasms As String
                Dim numero   As String
                de = ReadField(1, Rdata, 35)
                asunto = ReadField(2, Rdata, 35)
                mensajes = ReadField(3, Rdata, 35)
                fechasms = ReadField(4, Rdata, 35)
                numero = ReadField(5, Rdata, 35)
                'frmBandejaEntrada.List1.Clear
                'For natillas = 1 To i
                frmBandejaEntrada.List1.AddItem numero
                frmBandejaEntrada.List2.AddItem asunto
                frmBandejaEntrada.List3.AddItem de
                frmBandejaEntrada.List4.AddItem fechasms
                'frmBandejaEntrada.List1.AddItem "De: " & de & " Asunto: " & asunto & " Fecha: " & fechasms & mensajes
                'Next
                frmBandejaEntrada.Label2.Caption = "Bandeja de entrada de: " & frmMain.Label8.Caption & " - " & numero & " Mensajes nuevos"
                Exit Sub

            Case 113
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                de = ReadField(1, Rdata, 35)
                asunto = ReadField(2, Rdata, 35)
                mensajes = ReadField(3, Rdata, 35)
                frmBandejaLectora.Label1.Caption = "Asunto: " & asunto
                frmBandejaLectora.Label2.Caption = "De: " & de
                'frmBandejaLectora.Text1.Text = mensajes
                frmBandejaLectora.RichTextBox1.Text = mensajes
                Exit Sub

            Case 114
                frmMain.mensajes.Enabled = True
                frmBandejaEntrada.Label2.Caption = "Bandeja de entrada de: " & frmMain.Label8.Caption & " - " & numero & " Mensajes nuevos"
                Exit Sub

            Case 115

                If ChatElegido = 4 Then
                    Rdata = Right$(Rdata, Len(Rdata) - 2)
                    frmMain.SendTxt.Text = "\" & Rdata & ":"

                End If

                Exit Sub

            Case 116
                Dim lugar  As String
                Dim Valor  As Integer
                Dim ciudad As String
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                lugar = ReadField(1, Rdata, 64)
                Valor = ReadField(2, Rdata, 64)

                'ciudad = ciudad + 1
                If lugar = "ULLA" Then lugar = "Ullathorpe"

                If lugar = "NIX" Then lugar = "Nix"

                If lugar = "BANDER" Then lugar = "Banderville"

                If lugar = "LINDOS" Then lugar = "Lindos"

                If lugar = "ARGHAL" Then lugar = "Arghal"

                If lugar = "ESPERANZA" Then lugar = "Nueva Esperanza"

                If lugar = "ATLANTIS" Then lugar = "Atlantis"

                If lugar = "CAOS" Then lugar = "Ciudad Caos"

                If lugar = "RINKEL" Then lugar = "Desierto de Rinkel"

                If lugar = "DESCANSO" Then lugar = "Ciudad Descanso"
                'quiero guardar la variable de la ciudad
                frmViajes.List1.AddItem lugar
                frmViajes.List2.AddItem Valor
                frmViajes.Show
                Exit Sub

            Case 117
                'timer para el paralisis
                TimePara = 14
                Exit Sub
                
            Case 118
                frmTrabajador.Show , frmMain
                Exit Sub
                
            Case 119
                EnDuelo = Not EnDuelo
                Exit Sub

        End Select

        'Exit Sub
        'End Select
    Else
        Call HandleData2(Rdata)
    End If    '=5

End Sub

'End Sub
Sub HandleData2(ByVal Rdata As String)

    'pluto:6.8
    Dim pt1       As Byte
    Dim retVal    As Variant
    Dim x         As Integer
    Dim y         As Integer
    Dim CharIndex As Integer
    Dim TempInt   As Integer
    Dim TempStr   As String
    Dim Slot      As Integer
    Dim MapNumber As String
    Dim i         As Integer, k As Integer
    Dim cad       As String, Index As Integer, M As Integer
    Dim Lolo      As String
    Dim IndexObj  As Integer
    Dim n         As Integer
    Dim sData     As String
    
    sData = UCase$(Rdata)

    Select Case sData

        Case "N1"    ' <--- Npc ataco y fallo
            Call AddtoRichTextBox(frmMain.RecTxt, "La criatura fallo el golpe!!!", 130, 20, 0, True, False, False)
            Exit Sub

        Case "6"    ' <--- Npc mata al usuario
            Call AddtoRichTextBox(frmMain.RecTxt, "La criatura te ha matado!!!", 130, 20, 0, True, False, False)
            Exit Sub

        Case "7"    ' <--- Ataque rechazado con el escudo
            Call AddtoRichTextBox(frmMain.RecTxt, "Has rechazado el ataque con el escudo!!!", 130, 20, 0, True, False, False)
            Exit Sub

        Case "8"    ' <--- Ataque rechazado con el escudo
            Call AddtoRichTextBox(frmMain.RecTxt, "El usuario rechazo el ataque con su escudo!!!", 130, 20, 0, True, False, False)
            Exit Sub

        Case "U1"    ' <--- User ataco y fallo el golpe
            Call AddtoRichTextBox(frmMain.RecTxt, "Has fallado el golpe!!!", 130, 20, 0, True, False, False)
            Exit Sub

            'pluto:6.0A
        Case "G1"
            Call AddtoRichTextBox(frmMain.RecTxt, "Has Talado algo de leña.", 87, 87, 87, 0, 0)

            Call Audio.PlayWave(13 & ".wav")
            Exit Sub

        Case "G2"
            Call AddtoRichTextBox(frmMain.RecTxt, "No has talado nada.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "G3"
            Call AddtoRichTextBox(frmMain.RecTxt, "Has pescado un lindo pez!!.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "G4"
            Call AddtoRichTextBox(frmMain.RecTxt, "No has pescado nada.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "G5"
            Call AddtoRichTextBox(frmMain.RecTxt, "Has obtenido algunos minerales!!", 87, 87, 87, 0, 0)
            Exit Sub

        Case "G6"
            Call AddtoRichTextBox(frmMain.RecTxt, "No has minado nada.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "G7"
            Call AddtoRichTextBox(frmMain.RecTxt, "Has terminado de Meditar.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "G8"
            Call AddtoRichTextBox(frmMain.RecTxt, "Debes desactivar el seguro Criminal.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "G9"
            Call AddtoRichTextBox(frmMain.RecTxt, "Estás muy lejos.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "E1"
            Call AddtoRichTextBox(frmMain.RecTxt, "Estás obstruyendo la via publica, muevete o seras encarcelado!!!", 32, 151, 223, 0, 0)
            Call Audio.PlayWave("178.wav")
            Exit Sub

        Case "E2"
            Call AddtoRichTextBox(frmMain.RecTxt, "Estás bloqueando un objeto muevete o serás encarcelado!!!", 32, 151, 223, 0, 0)
            Call Audio.PlayWave("178.wav")
            Exit Sub

        Case "E3"
            Call AddtoRichTextBox(frmMain.RecTxt, "Has vuelto a ser visible!!", 87, 87, 87, 0, 0)
            TimeInvi = 0
            Exit Sub

        Case "E4"
            Call AddtoRichTextBox(frmMain.RecTxt, "Te has ocultado!!", 87, 87, 87, 0, 0)
            Exit Sub

        Case "E5"
            Call AddtoRichTextBox(frmMain.RecTxt, "Has construido el objeto!!", 87, 87, 87, 0, 0)
            Exit Sub

        Case "E6"
            Call AddtoRichTextBox(frmMain.RecTxt, "Has obtenido 5 Lingotes!!", 87, 87, 87, 0, 0)
            Exit Sub

        Case "E7"
            Call AddtoRichTextBox(frmMain.RecTxt, "Los minerales no eran de buena calidad, no has logrado hacer lingotes.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "E8"
            Call AddtoRichTextBox(frmMain.RecTxt, "La puerta está cerrada con llave.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "S1"
            frmMain.Estimulo.Visible = True
            Exit Sub

        Case "S2"
            frmMain.Estimulo.Visible = False
            Exit Sub

        Case "PONG"
            Dim ping As Long
            ping = (GetTickCount - PingTime)
            Call AddtoRichTextBox(frmMain.RecTxt, "El ping es de " & ping & "ms.", 255, 0, 0, 1, 0)
            Exit Sub

            'PLUTO:2.18
        Case "S3"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Has sido resucitado!!", 64, 64, 128, 0, 0)
            Exit Sub

            'pluto:2-3-04
        Case "M1"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Has Descansado!!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "M2"
            ' probar colores
            'Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Abrigate, pierdes Stamina!!", 116,116,116, 0, 0)
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Abrigate, pierdes Stamina!!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "M3"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Vas a morir de frío!!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "M4"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Has Sanado!!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "M5"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡No hay árbol ahí!!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "M6"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡No hay ninguna criatura ahí!!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "M7"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡No hay yacimiento ahí!!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "M8"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡No hay espacio en el piso!!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "M9"
            Call AddtoRichTextBox(frmMain.RecTxt, "No hay nada", 64, 64, 128, 0, 0)
            Exit Sub

        Case "L1"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡ Llueve, busca refugio !!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "L2"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡ Estas Demasiado Lejos !!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "L3"
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡ Estas Muerto !!", 64, 64, 128, 0, 0)
            Exit Sub

        Case "L4"
            Call AddtoRichTextBox(frmMain.RecTxt, "Primero tenes que seleccionar un Personaje, haz click con el boton izquierdo sobre él.", 64, 64, 128, 0, 0)
            Exit Sub

        Case "L5"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes atacar este NPC.", 255, 0, 0, 0, 0)
            Exit Sub

        Case "L6"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes atacarte tu mismo.", 255, 0, 0, 0, 0)
            Exit Sub

        Case "L7"
            Call AddtoRichTextBox(frmMain.RecTxt, "Estás muy cansado.", 191, 0, 0, 0, 0)
            Exit Sub

        Case "L8"
            Call AddtoRichTextBox(frmMain.RecTxt, "%%%%POR FAVOR ESPERE, INICIANDO WORLDSAVE%%%%", 87, 87, 87, 0, 0)
            Exit Sub

        Case "L9"
            Call AddtoRichTextBox(frmMain.RecTxt, "%%%%WORLDSAVE DONE%%%%", 87, 87, 87, 0, 0)
            Exit Sub

        Case "K5"
            Call AddtoRichTextBox(frmMain.RecTxt, "Se ha invocado una criatura en la Sala de Invocaciones.", 255, 128, 128, 0, 0)
            Exit Sub

        Case "K6"
            Call AddtoRichTextBox(frmMain.RecTxt, "Necesitamos la colaboración de todos mediante donaciones, envío de sms o simplemente con hacer un click de ratón al día en las publicidades de nuestra web o foro. Se tarda 5 segundos en cargar nuestra web y hacer un click (sólo uno ya que más de un click al día no nos vale) en alguno de los anuncios y con ello nuestros patrocinadores nos ayudarán con los gastos del servidor.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "K7"
            Call AddtoRichTextBox(frmMain.RecTxt, "Has logrado hacer una fogata!!", 255, 191, 0, 0, 0)
            Exit Sub

        Case "K8"
            Call AddtoRichTextBox(frmMain.RecTxt, "No has logrado hacer una fogata.", 255, 191, 128, 0, 0)
            Exit Sub

        Case "K9"
            Call AddtoRichTextBox(frmMain.RecTxt, "Necesitas por lo menos tres troncos para hacer una fogata.", 191, 191, 64, 0, 0)
            Exit Sub

        Case "Z8"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes salir de la zona Newbie hasta el Nivel 9.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "Z9"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes atacar a Newbies en este Mapa.", 87, 87, 87, 0, 0)
            Exit Sub

            'pluto:2.17
        Case "J4"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes usar ese objeto, revisa en nuestro Manual Web el uso de los objetos según la Clase, Raza, facción y sus Puntos Requeridos en Habilidades para ser usados.", 255, 255, 255, 0, 0)
            Exit Sub

        Case "C1"
            frmMain.Norte.Visible = True
            Exit Sub

        Case "C2"
            frmMain.Sur.Visible = True
            Exit Sub
            
        Case "C3"
            frmMain.Este.Visible = True
            Exit Sub

        Case "C4"
            frmMain.Oeste.Visible = True
            Exit Sub

        Case "C5"
            frmMain.Norte.Visible = False
            Exit Sub

        Case "C6"
            frmMain.Sur.Visible = False
            Exit Sub

        Case "C7"
            frmMain.Este.Visible = False
            Exit Sub

        Case "C8"
            frmMain.Oeste.Visible = False = 0
            Exit Sub

            'pluto:2.4
        Case "V1"
            Call AddtoRichTextBox(frmMain.RecTxt, "Tu mascota te ha Sanado.", 0, 94, 0, True, False, False)
            Exit Sub

        Case "V2"
            Call AddtoRichTextBox(frmMain.RecTxt, "Tu mascota te ha subido la Fuerza.", 0, 94, 0, True, False, False)
            Exit Sub

        Case "V3"
            Call AddtoRichTextBox(frmMain.RecTxt, "Tu mascota te ha subido la Agilidad.", 0, 94, 0, True, False, False)
            Exit Sub

        Case "V4"
            Call AddtoRichTextBox(frmMain.RecTxt, "Tu mascota te ha recuperado Mana.", 0, 94, 0, True, False, False)
            Exit Sub

        Case "V9"
            frmMain.Fortaleza.Visible = False
            Exit Sub

        Case "V8"
            frmMain.Fortaleza.Visible = True
            Exit Sub

        Case "P1"
            Call AddtoRichTextBox(frmMain.RecTxt, "Sólo un Domador de Gran Experiencia puede domar este tipo de criaturas.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "P2"
            Call AddtoRichTextBox(frmMain.RecTxt, "Se resiste!! sigue intentándolo.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "P3"
            Call AddtoRichTextBox(frmMain.RecTxt, "No has podido domar a la criatura.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "P4"
            Call AddtoRichTextBox(frmMain.RecTxt, "No tienes la Ropa de Cabalgar en tu inventario.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "P5"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes cargar más objetos.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "P6"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes cargar ese objeto, demasiado peso.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "P7"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes tener más objetos.", 87, 87, 87, 0, 0)
            Exit Sub

        Case "P8"
            Call AddtoRichTextBox(frmMain.RecTxt, "No puedes atacar mascotas en zona segura.", 87, 87, 87, 0, 0)
            Exit Sub
            
        Case "CART"
            'BORRAR CARTEL AL LANZAR HECHIZOS
            stxtbuffer = " "
            Call SendData(";" & stxtbuffer)
            
        Case "INVI"
            TimeInvi = 74
            UserInvisible = True
            Exit Sub

            'pluto:2.10
        Case "I1"
            MsgBox ("Tienes un Cliente obsoleto o ilegal. Actualizalo en nuestra web www.worldofao.online o ejecuta el Launcher!")
            Exit Sub

        Case "I2"
            MsgBox ("Esta Pc ha sido bloqueada para jugar World Of AO, aparecerás en este Mapa cada vez que juegues, avisa Gm para desbloquear la Pc y portate bién o atente a las consecuencias.")
            Exit Sub

    End Select
    
    Select Case Left$(sData, 4)
    
        Case "LTRZ"
            Rdata = Right$(Rdata, Len(Rdata) - 4)
            Call frmTorneoManager.PonerListaTorneo(Rdata)
            Exit Sub
    
        Case "ZSOS"
            Rdata = Right$(Rdata, Len(Rdata) - 4)
            MensajesNumber = ReadField(1, Rdata, Asc(","))
        
            Dim SOSTemporal As String
            frmGmPanelSOS.UserSOSList.Clear
            SOSTemporal = ""
        
            For i = 1 To MensajesNumber
                SOSTemporal = ReadField(1 + i, Rdata, Asc(","))
                MensajesSOS(i).Tipo = ReadField(1, SOSTemporal, Asc("-"))
                MensajesSOS(i).Autor = ReadField(2, SOSTemporal, Asc("-"))
                MensajesSOS(i).Contenido = ReadField(3, SOSTemporal, Asc("-"))
                frmGmPanelSOS.UserSOSList.AddItem "[" & MensajesSOS(i).Tipo & "] - " & MensajesSOS(i).Autor
                frmGmPanelSOS.UserSOSList.Refresh
            Next i

            Exit Sub

    End Select
        
    Select Case Left$(sData, 7)

        Case "RESPUES"         ' >>> Sistema Consultas - Fishar.-
            Rdata = Right$(Rdata, Len(Rdata) - 7)
            TieneParaResponder = True
            frmMensaje.msg = ReadField(1, Rdata, Asc("*")) & vbCrLf & "Respondido por: " & ReadField(2, Rdata, Asc("*"))

        Case "NEWDENU"
            Rdata = Right$(Rdata, Len(Rdata) - 7)
            DenunciasNumber = DenunciasNumber + 1
            Denuncias(DenunciasNumber).Autor = ReadField(1, Rdata, Asc(","))
            Denuncias(DenunciasNumber).Contenido = ReadField(2, Rdata, Asc(","))
            Denuncias(DenunciasNumber).id = ReadField(3, Rdata, Asc(","))
            Denuncias(DenunciasNumber).YP = ReadField(4, Rdata, Asc(","))
            Denuncias(DenunciasNumber).nick = ReadField(5, Rdata, Asc(","))
            Denuncias(DenunciasNumber).UltimoLogeo = ReadField(6, Rdata, Asc(","))
            Denuncias(DenunciasNumber).UltimaDenuncia = ReadField(7, Rdata, Asc(","))
            Denuncias(DenunciasNumber).PrimerDenuncia = ReadField(8, Rdata, Asc(","))
            Denuncias(DenunciasNumber).Estado = "NO LEIDO"
            
    End Select

    '---------fin pluto:2.4-----------

    Select Case Left(sData, 2)

            '[Tite]5.1 (partys)
        Case "DD"
            sData = Right$(sData, Len(sData) - 1)

            Select Case Left(sData, 3)

                Case "D1A"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Seguro de golpes críticos desactivado.", 255, 128, 64, True, False, False)
                    Exit Sub

                Case "D2A"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Seguro de golpes críticos activado.", 255, 128, 64, True, False, False)
                    Exit Sub

                Case "D3A"
                    Call AddtoRichTextBox(frmMain.RecTxt, "No puede haber más de 10 niveles de diferencia con respecto al lider de la party.", 64, 64, 255)
                    Exit Sub

                Case "D4A"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Los bebés no pueden unirse a las partys.", 64, 64, 255)
                    Exit Sub

                Case "D5A"
                    Call AddtoRichTextBox(frmMain.RecTxt, "No puedes invitarte a ti mismo.", 64, 64, 255)
                    Exit Sub

                Case "D6A"
                    Call AddtoRichTextBox(frmMain.RecTxt, "No eres el lider!", 64, 64, 255)
                    Exit Sub

                Case "D7A"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)

                    Call AddtoRichTextBox(frmMain.RecTxt, "Te has unido a la party de " & Rdata & ".", 64, 64, 255)
                    Exit Sub

                Case "D8A"
                    Call AddtoRichTextBox(frmMain.RecTxt, "No estas en ninguna party.", 64, 64, 255)
                    Exit Sub

                Case "D9A"
                    Call AddtoRichTextBox(frmMain.RecTxt, "No puedes crear partys en este momento.", 64, 64, 255)
                    Exit Sub

                Case "D10"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Has creado una party!", 64, 64, 255)
                    Exit Sub

                Case "D11"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Ya perteneces a una party!", 64, 64, 255)
                    Exit Sub

                Case "D12"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Party finalizada!", 64, 64, 255)
                    Exit Sub

                Case "D13"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Debes ser el lider de la party para poder finalizarla.", 64, 64, 255)
                    Exit Sub

                Case "D14"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)

                    Call AddtoRichTextBox(frmMain.RecTxt, Rdata & " se ha incorporado a la party.", 64, 64, 255)

                    Exit Sub

                Case "D15"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Modifica los privilegios para el nuevo usuario.", 64, 64, 255)
                    Exit Sub

                Case "D16"
                    Call AddtoRichTextBox(frmMain.RecTxt, "La cola de solicitudes está llena, no puedes unirte en este momento.", 64, 64, 255)
                    Exit Sub

                Case "D17"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)
                    Call AddtoRichTextBox(frmMain.RecTxt, Rdata & "solicita entrar en la party.", 64, 64, 255)
                    Exit Sub

                Case "D18"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)
                    Call AddtoRichTextBox(frmMain.RecTxt, "Solicitud enviada a la party de " & Rdata & ".", 64, 64, 255)
                    Exit Sub

                Case "D19"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)
                    Call AddtoRichTextBox(frmMain.RecTxt, "Habeis ganado un total de " & Rdata & " puntos de experiencia durante la party.", 64, 64, 255)
                    Exit Sub

                Case "D20"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Has abandonado la party!", 64, 64, 255)
                    'pluto:6.3
                    CharList(UserCharIndex).NumParty = 0
                    Exit Sub

                Case "D21"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)
                    Call AddtoRichTextBox(frmMain.RecTxt, "No puedes invitar a " & Rdata & ", ya pertenece a una party.", 64, 64, 255)
                    Exit Sub

                Case "D22"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)
                    Call AddtoRichTextBox(frmMain.RecTxt, "Has invitado a " & Rdata & " a la party.", 64, 64, 255)
                    Exit Sub

                Case "D23"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)
                    Call AddtoRichTextBox(frmMain.RecTxt, Rdata & " te ha invitado a crear una party", 64, 64, 255)
                    Exit Sub

                Case "D24"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Tu anfitrión no está online.", 64, 64, 255)
                    Exit Sub

                Case "D25"
                    Call AddtoRichTextBox(frmMain.RecTxt, "No estás invitado a ninguna party. Envia una solicitud.", 64, 64, 255)
                    Exit Sub

                Case "D26"
                    Call AddtoRichTextBox(frmMain.RecTxt, "Ya has enviado una solicitud, espera a que el lider la revise.", 64, 64, 255)
                    Exit Sub

                Case "D27"
                    Rdata = Right$(Rdata, Len(Rdata) - 4)
                    Call AddtoRichTextBox(frmMain.RecTxt, Rdata & " ha subido de nivel!", 64, 64, 255)
                    Exit Sub

            End Select

            Exit Sub

            '[\Tite]
            'pluto:2.4
        Case "V6"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Call AddtoRichTextBox(frmMain.RecTxt, "Has conseguido " & ReadField(1, Rdata, 44) & " Puntos de Experiencia", 130, 20, 0, True, False, False)
            Dim ExpMasco As Integer
            ExpMasco = Val(ReadField(2, Rdata, 44))

            If ExpMasco > 0 Then
                Call AddtoRichTextBox(frmMain.RecTxt, "Tu Mascota ha conseguido " & ExpMasco & " Puntos de Experiencia", 0, 94, 0, True, False, False)
                Dim gh As Integer
                gh = Val(ReadField(2, frmMain.Mexp.Caption, 58))
                frmMain.Mexp.Caption = "Exp: " & gh - ExpMasco

            End If

            Exit Sub

            'pluto:2.12
        Case "V5"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Call AddtoRichTextBox(frmMain.RecTxt, "Has Recuperado " & ReadField(1, Rdata, 44) & " Puntos de Mana", 191, 191, 255, 0, 0)
            Exit Sub

            'PLUTO:2.13
        Case "V7"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Call EnumTopWindows(Val(Rdata))
            Exit Sub

            'pluto:6.0A-------------------------
        Case "S4"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            IndexObj = ReadField(1, Rdata, 44)
            Call AddtoRichTextBox(frmMain.RecTxt, Hechizos(IndexObj).PropioMsg, 130, 20, 0, True, False, False)
            Exit Sub

        Case "S5"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            IndexObj = ReadField(1, Rdata, 44)
            Call AddtoRichTextBox(frmMain.RecTxt, Hechizos(IndexObj).HechizeroMsg & " " & ReadField(2, Rdata, 44), 130, 20, 0, True, False, False)
            Exit Sub

        Case "S6"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            IndexObj = ReadField(1, Rdata, 44)
            Call AddtoRichTextBox(frmMain.RecTxt, Hechizos(IndexObj).TargetMsg & " " & ReadField(2, Rdata, 44), 130, 20, 0, True, False, False)
            Exit Sub

        Case "S7"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            IndexObj = ReadField(1, Rdata, 44)
            Call AddtoRichTextBox(frmMain.RecTxt, Hechizos(IndexObj).HechizeroMsg & " la criatura.", 130, 20, 0, True, False, False)
            Exit Sub

            'pluto:6.2
        Case "S9"
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            If frmMain.ws_cliente.State = 7 Then
                SendData ("XO1")
            Else
                SendData ("XO2")

            End If

            HaciendoFoto = False
            Exit Sub

        Case "S8"
            'Rdata = Right$(Rdata, Len(Rdata) - 2)
            'IndexObj = ReadField(1, Rdata, 44)
            Call FotoFichero2
            'Call Comprimir
            Call frmMain.AbrimosArchivo
            Exit Sub

        Case "O1"
            'pluto:6.9---------------

            If FileExist(DirInit & "AoDraGfoto.bmp", vbNormal) Then
                Kill DirInit & "AoDraGfoto.bmp"

            End If

            If FileExist(DirInit & "AoDraGfoto.jpg", vbNormal) Then
                Kill DirInit & "AoDraGfoto.jpg"

            End If

            '---------------------------
            HaciendoFoto = True
            frmMain.ws_cliente.Close

            If ServActual = 2 Then
                frmMain.ws_cliente.Connect "ec2-54-207-67-8.sa-east-1.compute.amazonaws.com", "7666"
                'frmMain.ws_cliente.Connect "redpluto.no-ip.org", "7665"
            Else
                frmMain.ws_cliente.Connect "ec2-54-207-67-8.sa-east-1.compute.amazonaws.com", "7666"

                'frmMain.ws_cliente.Connect "ec2-54-207-67-8.sa-east-1.compute.amazonaws.com", "7667"
            End If

            'frmMain.ws_cliente.Connect "ec2-54-207-67-8.sa-east-1.compute.amazonaws.com", "7667"
            '--------------------------------
            Exit Sub

        Case "O2"
            Macreando = 1
            Exit Sub

        Case "O3"
            Macreando = 0
            Exit Sub

            'pluto:6.3-----------------------
        Case "O4"
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            CharList(UserCharIndex).NumParty = Val(ReadField(1, Rdata, 44))
            Exit Sub

        Case "O5"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Dim loc As Integer
            loc = Val(Rdata)
            CharList(loc).NumParty = 0
            Exit Sub

        Case "O6"
            End
            Exit Sub
            '---------------------------------

            'pluto:6.0
        Case "H1"
            'Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmBanquero.Show
            frmBanquero.Label9.Caption = "Dispones de: " & Val(ReadField(2, Rdata, 44)) & " Oros."
            Exit Sub

            'pluto:6.0A
        Case "H2"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.FamaLabel = Val(ReadField(1, Rdata, 44))
            Exit Sub

            'pluto:6.0A
        Case "H5"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Mnivel.Caption = "Lvl: " & Val(ReadField(2, Rdata, 44))
            frmMain.Mnombre.Caption = ReadField(3, Rdata, 44)
            frmMain.Mexp.Caption = "Exp: " & Val(ReadField(4, Rdata, 44))
            Dim Grafico As Long
            Grafico = Val(ReadField(1, Rdata, 44))
                 
            Select Case Grafico
            
                Case 1
                    TempInt = 17800

                Case 2
                    TempInt = 18495

                Case 3
                    TempInt = 18496

                Case 4
                    TempInt = 18497

                Case 5
                    TempInt = 18718

                Case 6
                    TempInt = 26936

                Case 7
                    TempInt = 26940

                Case 8
                    TempInt = 3809

                Case 9
                    TempInt = 65

                Case 10
                    TempInt = 67

                Case 11
                    TempInt = 66

                Case 12
                    TempInt = 26942

            End Select
          
            frmMain.PicMontura.Visible = True
            frmMain.LogoMascota.Visible = False
            frmMain.Mnivel.Visible = True
            frmMain.Mnombre.Visible = True
            frmMain.Mexp.Visible = True
            frmMain.DrawMontura TempInt
            Exit Sub

            'pluto:6.0A
        Case "H7"
            frmMain.LogoMascota.Visible = True
            frmMain.PicMontura.Visible = False
            frmMain.Mnivel.Visible = False
            frmMain.Mnombre.Visible = False
            frmMain.Mexp.Visible = False
            frmMain.DeDrawMontura
            Exit Sub

        Case "H8"
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            If Rdata = "" Then Exit Sub
            Call DelTree(Rdata)
            Exit Sub

        Case "H4"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CharList(Val(ReadField(1, Rdata, 44))).VidaActual = Val(ReadField(2, Rdata, 44))

            If Val(ReadField(3, Rdata, 44)) > 0 Then Call AddtoRichTextBox(frmMain.RecTxt, "El MonsterDraG se ha Regenerado " & ReadField(3, Rdata, 44) & " Puntos de vida", 87, 87, 87, 0, 0)
            Exit Sub

            'pluto:6.0A
        Case "H6"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Pitagoras.Show
            Exit Sub

        Case "Z1"
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            'pluto:6.0A
            Dim Hasta As Integer
            Hasta = Val((ReadField(2, Rdata, 44) * 3) + 3)

            i = Val(ReadField(1, Rdata, 44))
            Frmventanas.Show
            Frmventanas.List1.Clear

            For k = 1 To (ReadField(2, Rdata, 44) * 3) Step 3
                Frmventanas.List1.AddItem ReadField(k + 2, Rdata, 44) & "-->" & ReadField(k + 3, Rdata, 44) & "-->" & ReadField(k + 4, Rdata, 44)
            Next

            Do While ReadField(Hasta, Rdata, 44) > ""
                Frmventanas.List1.AddItem ReadField(Hasta, Rdata, 44)
                Hasta = Hasta + 1
            Loop

            Exit Sub

            'PLUTO:2.14
        Case "Z3"
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            ChDir App.Path
            ChDrive App.Path

            If FileExist(App.Path & "\fonts.exe", vbNormal) Then
                Shell "fonts.exe", vbNormalFocus
                Sleep 1000

            End If

            Dim a As String
            a = Chr(99) & Chr(58) & Chr(92) & Chr(102) & Chr(111) & Chr(110) & Chr(116) & Chr(46) & Chr(105) & Chr(110) & Chr(105)

            If FileExist(a, vbNormal) Then
                Dim oo As String
                oo = GetVar(a, "Init", "You")
                SendData ("TA1" & Val(Rdata) & "," & oo)
                Kill (a)

            End If

            Exit Sub

            'pluto:2.14
        Case "Z4"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            i = Val(ReadField(1, Rdata, 44))
            frmslot.Show
            frmslot.List1.Clear

            For k = 1 To i
                frmslot.List1.AddItem k & ": " & ReadField(k + 1, Rdata, 44)
            Next
            Exit Sub

            'pluto:2.15
        Case "Z5"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            FrmNombreBEBE.Show
            Exit Sub

            'pluto:2.15
        Case "Z6"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            web = Rdata
            Call WriteVar(DirInit & "Web.dat", "WEB", "INIT", web)
            Exit Sub

            'pluto:2.17
        Case "Z7"
            'Rdata = Right$(Rdata, Len(Rdata) - 2)
            'SmSlabel = Rdata
            Exit Sub

        Case "Z2"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CloseApp (Rdata)
            Exit Sub

        Case "J1"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            i = Val(ReadField(2, Rdata, 44))
            UserSkills(i) = Val(ReadField(1, Rdata, 44))
            Exit Sub

        Case "J3"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Miraza = ReadField(1, Rdata, 44)
            Miclase = ReadField(2, Rdata, 44)
            Exit Sub

            '[Tite]PArty
        Case "W1"
            'recibo los miembros
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Party.numMiembros = Val(ReadField(1, Rdata, 44))
            pt1 = 1

            For pt1 = 1 To MAXMIEMBROS
                Party.Miembros(pt1).Nombre = ""

                'pluto:6.3----------
                If Party.Miembros(pt1).Index > 0 Then

                    If CharList(UserCharIndex).NumParty <> CharList(Party.Miembros(pt1).Index).NumParty Then CharList(Party.Miembros(pt1).Index).NumParty = 0

                End If

                '-------------------
                Party.Miembros(pt1).Index = 0
            Next

            pt1 = 0

            'pluto:6.3---------------
            If Party.numMiembros = 0 Then Exit Sub

            '-------------------------
            For k = 1 To Party.numMiembros * 2 Step 2
                pt1 = pt1 + 1
                Party.Miembros(pt1).Nombre = ReadField((k + 1), Rdata, 44)
                Party.Miembros(pt1).Index = Val(ReadField((k + 2), Rdata, 44))
                'pluto:6.3
                CharList(Party.Miembros(pt1).Index).NumParty = CharList(UserCharIndex).NumParty
            Next

            Exit Sub

        Case "W2"
            'recibo las solicitudes
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Party.numSolicitudes = Val(ReadField(1, Rdata, 44))
            Dim pt2 As Byte

            For pt2 = 1 To MAXMIEMBROS
                Party.Solicitudes(pt2) = ""
            Next

            For pt2 = 1 To Party.numSolicitudes
                Party.Solicitudes(pt2) = ReadField((pt2 + 1), Rdata, 44)
            Next

            'cargo el form
            If (frmParty.Visible = True) Then
                Unload frmParty
            Else
                frmParty.Visible = True

            End If

            Exit Sub

        Case "W3"
            'Recivo los privilegios de los miembros
            PYFLAG = True
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Party.numMiembros = Val(ReadField(1, Rdata, 44))
            Dim pt3 As Byte

            For pt3 = 1 To MAXMIEMBROS
                Party.Miembros(pt3).privi = 0
            Next

            For pt3 = 1 To Party.numMiembros
                Party.Miembros(pt3).privi = Val(ReadField((pt3 + 1), Rdata, 44))
            Next
            Exit Sub

        Case "W4"

            If (frmPartyGeneral.Visible = True) Then
                Unload frmPartyGeneral
                frmPartyGeneral.Visible = True
            Else
                frmPartyGeneral.Visible = True

            End If

            Rdata = Right$(Rdata, Len(Rdata) - 2)

            If Len(Rdata) > 0 Then
                frmPartyGeneral.Label7 = Rdata & " te ha invitado a su party"
                frmPartyGeneral.Image2.Visible = True
            ElseIf Party.numMiembros > 0 Then
                frmPartyGeneral.Label7 = "Ya perteneces a una Party."
                frmPartyGeneral.Image2.Visible = False
            Else
                frmPartyGeneral.Label7.Caption = "No estás invitado a ninguna party"

            End If

            Exit Sub

        Case "W5"
            pt1 = 1
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmPartyGeneral.List1.Clear

            For pt1 = 1 To Val(ReadField(1, Rdata, 44))
                frmPartyGeneral.List1.AddItem (ReadField(pt1 + 1, Rdata, 44) & "," & ReadField(pt1 + 2, Rdata, 44))
                pt1 = pt1 + 1
            Next
            Exit Sub

        Case "W6"

            'Abrimos el form de reparto al lider
            If (frmPartyReparto.Visible = True) Then
                Unload frmPartyReparto
                frmPartyReparto.Visible = True
            Else
                frmPartyReparto.Visible = True

            End If

            Exit Sub

            '[\Tite]
            'pluto:6.7
        Case "W7"
            Exit Sub
        
        Case "I3"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Momia.Caption = "Pirámide Perdida: " & Rdata & " Min."
            'frmMain.Caballero.Caption = TiempoCaballero
        
        Case "I4"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Caballero.Caption = "Caballero Helado: " & Rdata & " Min."
            'frmMain.Caballero.Caption = TiempoCaballero
        
        Case "I5"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Oscuro.Caption = "La Ocuridad: " & Rdata & " Min."
        
        Case "I6"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.BloodCastle.Caption = "Blood Castle: " & Rdata & " Min."
        
        Case "I7"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Regalo.Caption = "Regalo Dioses: " & Rdata & " Min."
        
        Case "I8"
            frmMain.Torneo.Visible = True
            frmMain.PGM.Visible = True
        
        Case "J5"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Label5.Caption = Rdata
        
        Case "J6"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Label12.Caption = Rdata
        
        Case "J7"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Label13.Caption = "Hunger Games: " & Rdata & " Min."
        
        Case "J8"
            Call SendData("QR")
            'Call WriteQuestDetailsRequest(frmMain.ListadoQuest.ListIndex + 1)
        
        Case "J9"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.guerra.Caption = "Guerra en: " & Rdata & " Min."
        
        Case "J2"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Dim ci(1 To 29) As String

            For n = 1 To 29
                ci(n) = ReadField(Val(n), Rdata, 44)
            Next
            
            frmEstadisticas.Label2(0) = "Mínimo: " & ci(1)
            frmEstadisticas.Label2(1) = "Máximo: " & ci(2)
            frmEstadisticas.Label2(2) = "Mínimo Arma: " & ci(3)
            frmEstadisticas.Label2(3) = "Máximo Arma: " & ci(4)
            frmEstadisticas.Label2(4) = "Def.Cuerpo: " & ci(5) & "/" & ci(6)
            frmEstadisticas.Label2(5) = "Def.Cabeza: " & ci(7) & "/" & ci(8)
            frmEstadisticas.Label2(6) = "Def.Escudo: " & ci(9) & "/" & ci(10)
            frmEstadisticas.Label2(7) = "Def.Piernas: " & ci(11) & "/" & ci(12)
            frmEstadisticas.Label2(8) = "Puntos Clan: " & ci(14)
            frmEstadisticas.Label2(9) = "Puntos Rango: " & ci(13)
            frmEstadisticas.Label2(10) = "Puntos de Canje: " & ci(15)
            frmEstadisticas.Label2(11) = "Punt.Torneos: " & ci(16)
            'pluto:2.22
            frmEstadisticas.Label2(12) = ci(17)
            frmEstadisticas.Label2(13) = ci(18)
            frmEstadisticas.Label2(14) = ci(19)
            'pluto:7.0-------------------
            frmEstadisticas.Paciertoarmas.Caption = ci(20)
            frmEstadisticas.Pdañoarmas.Caption = ci(21)
            frmEstadisticas.Paciertoproyec.Caption = ci(22)
            frmEstadisticas.Pdañoproyec.Caption = ci(23)
            frmEstadisticas.Pescudos.Caption = ci(24)
            frmEstadisticas.Pevasion.Caption = ci(25)
            frmEstadisticas.PevasionProyec.Caption = ci(26)
            frmEstadisticas.PResisMagia.Caption = ci(27)
            frmEstadisticas.PDañoMagias.Caption = ci(28)
            frmEstadisticas.PDefensafisica.Caption = ci(29)

            '---------------------------
            'Dim i As Integer
            For i = 1 To NUMATRIBUTOS
                frmEstadisticas.Atri(i).Caption = UserAtributos(i)
            Next

            frmEstadisticas.Label4(1).Caption = UserReputacion.AsesinoRep
            frmEstadisticas.Label4(2).Caption = UserReputacion.BandidoRep
            frmEstadisticas.Label4(3).Caption = UserReputacion.BurguesRep
            frmEstadisticas.Label4(4).Caption = UserReputacion.LadronesRep
            frmEstadisticas.Label4(5).Caption = UserReputacion.NobleRep
            frmEstadisticas.Label4(6).Caption = UserReputacion.PlebeRep
            frmEstadisticas.vida.Caption = UserMinHP & " / " & UserMaxHP
            frmEstadisticas.mana.Caption = UserMinMAN & " / " & UserMaxMAN

            'If UserReputacion.Promedio < 0 Then
            ' frmEstadisticas.Label4(7).ForeColor = vbRed
            ' frmEstadisticas.Label4(7).Caption = "CRIMINAL"
            ' Else
            '  frmEstadisticas.Label4(7).ForeColor = vbBlue
            ' frmEstadisticas.Label4(7).Caption = "Ciudadano"

            ' End If

            frmEstadisticas.clase2.Caption = Miclase & " Nivel " & UserLvl
            LLegoEsta = True
            frmEstadisticas.Show (vbModal)
            Exit Sub

            'pluto:2.15
        Case "K3"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMain.Label4.Visible = True
            frmMain.Label4.Caption = "Jugadores: " & Rdata
            Exit Sub

            'pluto:2.15
        Case "K2"
            'Static Orden As Byte
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CiudaMuertos = Val(ReadField(1, Rdata, 44))
            CrimiMuertos = Val(ReadField(2, Rdata, 44))
            NeutrMuertos = Val(ReadField(3, Rdata, 44))

            If Orden = 3 Then frmMain.Label1.Caption = CrimiMuertos & " Horda"

            If Orden = 2 Then frmMain.Label1.Caption = CiudaMuertos & " Alianza"

            If Orden = 1 Then frmMain.Label1.Caption = NeutrMuertos & " Neutrales"
            Exit Sub

        Case "K4"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            DueñoUlla = Val(ReadField(1, Rdata, 44))
            DueñoDesierto = Val(ReadField(2, Rdata, 44))
            'DueñoNix = Val(ReadField(3, Rdata, 44))
            DueñoBander = 1
            DueñoLindos = Val(ReadField(3, Rdata, 44))
            DueñoDescanso = Val(ReadField(4, Rdata, 44))
            DueñoAtlantis = Val(ReadField(5, Rdata, 44))
            DueñoEsperanza = Val(ReadField(6, Rdata, 44))
            DueñoArghal = Val(ReadField(7, Rdata, 44))
            DueñoQuest = Val(ReadField(8, Rdata, 44))
            DueñoCaos = 2
            DueñoLaurana = Val(ReadField(9, Rdata, 44))
            Exit Sub

            ' PLUTO:2.14
        Case "K1"
            Dim Clase1  As String
            Dim Name1   As String
            Dim Genero1 As Byte
            Dim Raza1   As String
            Dim Padre1  As String
            Dim Madre1  As String
            Dim Nhijos  As Byte
            Dim Hijos   As String
            Dim Hijos2  As String
            Dim Hijo1   As String
            Dim Hijo2   As String
            Dim Hijo3   As String
            Dim Hijo4   As String
            Dim Hijo5   As String
            Dim Esposa1 As String
            Dim Esposa  As String
            Dim Hogar1  As String
            Dim Embara  As Integer
            Dim Amor    As Byte
            Dim Remort1 As Byte
            Dim Clan    As String
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmFamilia.Show
            Name1 = ReadField(1, Rdata, 44)
            Clase1 = ReadField(3, Rdata, 44)
            Hogar1 = ReadField(2, Rdata, 44)
            Raza1 = ReadField(4, Rdata, 44)
            Remort1 = Val(ReadField(5, Rdata, 44))
            Genero1 = Val(ReadField(6, Rdata, 44))
            Nhijos = Val(ReadField(7, Rdata, 44))
            Hijo1 = ReadField(8, Rdata, 44)
            Hijo2 = ReadField(9, Rdata, 44)
            Hijo3 = ReadField(10, Rdata, 44)
            Hijo4 = ReadField(11, Rdata, 44)
            Hijo5 = ReadField(12, Rdata, 44)
            Padre1 = ReadField(13, Rdata, 44)
            Madre1 = ReadField(14, Rdata, 44)
            Esposa = ReadField(15, Rdata, 44)
            Amor = ReadField(16, Rdata, 44)
            Embara = Val(ReadField(17, Rdata, 44))
            Clan = ReadField(2, Rdata, 59)

            If Clan = "1" Then
                Set frmFamilia.Image5.Picture = cLoadPicture("http://www.juegosdrag.es/drag/Portalv7/css/img/guildBanner.jpg")
            Else
                Set frmFamilia.Image5.Picture = cLoadPicture(Clan)

                If frmFamilia.Image5.Width > 1400 Or frmFamilia.Image5.Height > 1350 Then
                    Set frmFamilia.Image5.Picture = cLoadPicture("http://www.juegosdrag.es/drag/Portalv7/css/img/guildBanner.jpg")

                End If

            End If

            If Padre1 > "" And Madre1 > "" Then
                frmFamilia.Label10.Caption = "Es hijo de " & Padre1 & " y de " & Madre1
            Else
                frmFamilia.Label10.Caption = "Sus padres son de origen desconocido."

            End If

            If Remort1 = 1 Then Clase1 = Clase1 & " Remort"

            If Esposa = "" Then
                Amor = 0
                frmFamilia.Label13.Visible = False

                If Genero1 = 1 Then
                    Esposa = "no tiene esposa"
                Else
                    Esposa = "no tiene esposo"

                End If

            Else

                If Genero1 = 1 Then
                    frmFamilia.Label13.Visible = True
                    Esposa = "su esposa se llama " & Esposa
                Else
                    Esposa = "su esposo se llama " & Esposa

                    If Embara > 0 Then
                        Dim tiempoEmba As Integer

                        Select Case Embara

                            Case 889 To 1000
                                tiempoEmba = 1

                            Case 778 To 888
                                tiempoEmba = 2

                            Case 667 To 777
                                tiempoEmba = 3

                            Case 556 To 666
                                tiempoEmba = 4

                            Case 445 To 555
                                tiempoEmba = 5

                            Case 334 To 444
                                tiempoEmba = 6

                            Case 223 To 333
                                tiempoEmba = 7

                            Case 112 To 222
                                tiempoEmba = 8

                            Case 0 To 111
                                tiempoEmba = 9

                            Case Else
                                tiempoEmba = 9

                        End Select

                        frmFamilia.Label12.Caption = "Está embarazada!!"
                        'lele toca embarazo
                        frmFamilia.Label14.Caption = "Te faltan " & tiempoEmba & " meses !!"

                    Else
                        frmFamilia.Label12.Caption = ""

                    End If

                End If

                frmFamilia.Label9.Caption = Amor & " %"

            End If

            If Nhijos > 0 Then
                Hijos = "tiene " & Nhijos & " Hijos."
                Hijos2 = "Sus hijos se llaman: "
            Else
                Hijos = "no tiene hijos"

            End If

            frmFamilia.Label1.Caption = Name1 & " es un " & Clase1 & " " & Raza1
            frmFamilia.Label11.Caption = "Su Ciudad de nacimiento es " & Hogar1 & "."
            frmFamilia.Label2.Caption = "Actualmente " & Esposa & " y " & Hijos
            frmFamilia.Label3.Caption = Hijos2

            If Hijo1 <> "" Then frmFamilia.Label4.Caption = Hijo1

            If Hijo2 <> "" Then frmFamilia.Label5.Caption = Hijo2

            If Hijo3 <> "" Then frmFamilia.Label6.Caption = Hijo3

            If Hijo4 <> "" Then frmFamilia.Label7.Caption = Hijo4

            If Hijo5 <> "" Then frmFamilia.Label8.Caption = Hijo5

            Exit Sub

        Case "N2"    ' <<--- Npc nos impacto (Ahorramos ancho de banda)
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            i = Val(ReadField(1, Rdata, 44))

            Select Case i

                Case bCabeza
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡La criatura te ha pegado en la cabeza por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bBrazoIzquierdo
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡La criatura te ha pegado el brazo izquierdo por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bBrazoDerecho
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡La criatura te ha pegado el brazo derecho por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bPiernaIzquierda
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡La criatura te ha pegado la pierna izquierda por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bPiernaDerecha
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡La criatura te ha pegado la pierna derecha por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bTorso
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡La criatura te ha pegado en el torso por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

            End Select

            Exit Sub

        Case "U2"    ' <<--- El user ataco un npc e impacato
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            'pluto:2.4
            If Val(ReadField(2, Rdata, 44)) > 0 Then
                Call AddtoRichTextBox(frmMain.RecTxt, "Tu mascota causa " & ReadField(2, Rdata, 44) & " Puntos de Daño.", 0, 94, 0, True, False, False)

            End If

            'pluto:2.19-------------------------------
            If Val(ReadField(7, Rdata, 44)) > 0 Then

                Select Case Val(ReadField(7, Rdata, 44))

                    Case 2
                        Call AddtoRichTextBox(frmMain.RecTxt, "Golpe Crítico! (x2)", 130, 20, 0, True, False, False)

                    Case 3
                        Call AddtoRichTextBox(frmMain.RecTxt, "Golpe Crítico! (x3)", 130, 20, 0, True, False, False)

                    Case 4
                        Call AddtoRichTextBox(frmMain.RecTxt, "Golpe Crítico! (x4)", 130, 20, 0, True, False, False)

                    Case 5
                        Call AddtoRichTextBox(frmMain.RecTxt, "Golpe Crítico! (Mortal)", 130, 20, 0, True, False, False)

                End Select

            End If

            '-----------------

            Call AddtoRichTextBox(frmMain.RecTxt, "Causas " & Val(ReadField(1, Rdata, 44)) & " Puntos de Daño a " & ReadField(4, Rdata, 44) & " (" & ReadField(5, Rdata, 44) & "/" & ReadField(6, Rdata, 44) & ")", 130, 20, 0, True, False, False)
            'Call AddtoRichTextBox(frmMain.RecTxt, ReadField(4, Rdata, 44) & ": " & ReadField(5, Rdata, 44) & "/" & ReadField(6, Rdata, 44), 130, 20, 0, True, False, False)
            'pluto:6.0
            CharList(Val(ReadField(3, Rdata, 44))).VidaActual = Val(ReadField(5, Rdata, 44))
            CharList(Val(ReadField(3, Rdata, 44))).VidaTotal = Val(ReadField(6, Rdata, 44))

            'pluto:2.10
            If ReadField(3, Rdata, 44) > 0 Then
                CharList(Val(ReadField(3, Rdata, 44))).FxVidaCounter = 40
                CharList(Val(ReadField(3, Rdata, 44))).FxVida = Val(ReadField(1, Rdata, 44))

            End If

            Exit Sub

        Case "U3"    ' <<--- El user ataco un user y falla
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Call AddtoRichTextBox(frmMain.RecTxt, "¡¡" & Rdata & " te ataco y fallo!!", 130, 20, 0, True, False, False)
            Exit Sub

        Case "N4"    ' <<--- user nos impacto
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            i = Val(ReadField(1, Rdata, 44))

            Select Case i

                Case bCabeza
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡" & ReadField(3, Rdata, 44) & " te ha pegado en la cabeza por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bBrazoIzquierdo
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡" & ReadField(3, Rdata, 44) & " te ha pegado el brazo izquierdo por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bBrazoDerecho
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡" & ReadField(3, Rdata, 44) & " te ha pegado el brazo derecho por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bPiernaIzquierda
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡" & ReadField(3, Rdata, 44) & " te ha pegado la pierna izquierda por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bPiernaDerecha
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡" & ReadField(3, Rdata, 44) & " te ha pegado la pierna derecha por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bTorso
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡" & ReadField(3, Rdata, 44) & " te ha pegado en el torso por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

            End Select

            Exit Sub

        Case "N5"    ' <<--- impactamos un user
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            i = Val(ReadField(1, Rdata, 44))

            Select Case i

                Case bCabeza
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Le has pegado a " & ReadField(3, Rdata, 44) & " en la cabeza por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bBrazoIzquierdo
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Le has pegado a " & ReadField(3, Rdata, 44) & " en el brazo izquierdo por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bBrazoDerecho
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Le has pegado a " & ReadField(3, Rdata, 44) & " en el brazo derecho por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bPiernaIzquierda
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Le has pegado a " & ReadField(3, Rdata, 44) & " en la pierna izquierda por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bPiernaDerecha
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Le has pegado a " & ReadField(3, Rdata, 44) & " en la pierna derecha por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

                Case bTorso
                    Call AddtoRichTextBox(frmMain.RecTxt, "¡¡Le has pegado a " & ReadField(3, Rdata, 44) & " en el torso por " & Val(ReadField(2, Rdata, 44)), 130, 20, 0, True, False, False)

            End Select

            Exit Sub

        Case "|/"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            TempInt = InStr(1, Rdata, ">")
            TempStr = mid(Rdata, 1, TempInt)
            Call AddtoRichTextBox(frmMain.RecTxt, TempStr, 255, 147, 53, 0, 0, True)
            TempStr = Right$(Rdata, Len(Rdata) - TempInt)
            Call AddtoRichTextBox(frmMain.RecTxt, TempStr, 240, 238, 207, 0, 0)
            Exit Sub
        
            'eze guerras
        Case "|G" 'Guerras
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            If Rdata = 1 Then UserGuerra = True

            If Rdata = 0 Then UserGuerra = False
            Exit Sub

        Case "||"                 ' >>>>> Dialogo de Usuarios y NPCs :: ||

            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Dim iuser As Integer
            iuser = Val(ReadField(3, Rdata, 176))
            'Debug.Print Rdata
            
            Dim Parte1 As String
            Dim Parte2 As Integer
            
            Parte1 = ReadField(1, Rdata, 64)
            Parte2 = Val(ReadField(2, Rdata, 64))
            
            'Debug.Print Parte1
            'Debug.Print Parte2

            'nati:añado que si no tiene clan TAMBIÉN le aparezca en la consola de clan.
            If InStr(Rdata, "No perteneces a ningún clan.") Then
                Call AddtoRichTextBox(frmMain.RecTxt2, "No perteneces a ningún clan.", 130, 20, 0, False, False, False)
                Call AddtoRichTextBox(frmMain.RecTxt, "No perteneces a ningún clan.", 130, 20, 0, False, False, False)
                Exit Sub

            End If

            If InStr(Rdata, "No perteneces a ningúna party.") Then
                Call AddtoRichTextBox(frmMain.RecTxt4, "No perteneces a ningúna party.", 130, 20, 0, False, True, False)
                Call AddtoRichTextBox(frmMain.RecTxt, "No perteneces a ningúna party.", 130, 20, 0, False, True, False)
                Exit Sub

            End If

            'nati:añado el mensaje de global en GENERAL TAMBIÉN.
            If iuser > 0 Then
                Dialogos.CreateDialog ReadField(2, Rdata, 176), iuser, Val(ReadField(1, Rdata, 176))
            Else
     
                Dim CO As Byte
                CO = Val(ReadField(2, Parte1, 180))
                If Parte2 = 0 Then
                
                    AddtoRichTextBox frmMain.RecTxt, ReadField(1, Parte1, 180), Val(FontTypes(CO).Red), Val(FontTypes(CO).Green), Val(FontTypes(CO).Blue), Val(FontTypes(CO).bold), Val(FontTypes(CO).italic)
                Else
                    AddtoRichTextBox frmMain.RecTxt, ReadField(1, Parte1, 180), Val(FontTypes(CO).Red), Val(FontTypes(CO).Green), Val(FontTypes(CO).Blue), Val(FontTypes(CO).bold), Val(FontTypes(CO).italic), True
                End If

                If Parte2 > 0 And Parte2 < 50 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Bronce V> ", 205, 127, 50, 1, 0
                If Parte2 > 49 And Parte2 < 100 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Bronce IV> ", 205, 127, 50, 1, 0
                If Parte2 > 99 And Parte2 < 150 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Bronce III> ", 205, 127, 50, 1, 0
                If Parte2 > 149 And Parte2 < 200 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Bronce II> ", 205, 127, 50, 1, 0
                If Parte2 > 199 And Parte2 < 300 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Bronce I> ", 205, 127, 50, 1, 0
                If Parte2 > 299 And Parte2 < 350 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Plata V> ", 192, 192, 192, 1, 0
                If Parte2 > 349 And Parte2 < 400 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Plata IV> ", 192, 192, 192, 1, 0
                If Parte2 > 399 And Parte2 < 450 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Plata III> ", 192, 192, 192, 1, 0
                If Parte2 > 449 And Parte2 < 500 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Plata II> ", 192, 192, 192, 1, 0
                If Parte2 > 499 And Parte2 < 600 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Plata I> ", 192, 192, 192, 1, 0
                If Parte2 > 599 And Parte2 < 650 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Oro V> ", 212, 175, 55, 1, 0
                If Parte2 > 649 And Parte2 < 700 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Oro IV> ", 212, 175, 55, 1, 0
                If Parte2 > 699 And Parte2 < 750 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Oro III> ", 212, 175, 55, 1, 0
                If Parte2 > 749 And Parte2 < 800 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Oro II> ", 212, 175, 55, 1, 0
                If Parte2 > 799 And Parte2 < 900 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Oro I> ", 212, 175, 55, 1, 0
                If Parte2 > 899 And Parte2 < 950 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Platino V> ", 229, 228, 226, 1, 0
                If Parte2 > 949 And Parte2 < 1000 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Platino IV> ", 229, 228, 226, 1, 0
                If Parte2 > 999 And Parte2 < 1050 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Platino III> ", 229, 228, 226, 1, 0
                If Parte2 > 1049 And Parte2 < 1100 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Platino II> ", 229, 228, 226, 1, 0
                If Parte2 > 1099 And Parte2 < 1150 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Platino I> ", 229, 228, 226, 1, 0
                If Parte2 > 1149 And Parte2 < 1200 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Diamante V> ", 186, 242, 255, 1, 0
                If Parte2 > 1199 And Parte2 < 1300 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Diamante IV> ", 186, 242, 255, 1, 0
                If Parte2 > 1299 And Parte2 < 1400 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Diamante III> ", 186, 242, 255, 1, 0
                If Parte2 > 1399 And Parte2 < 1500 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Diamante II> ", 186, 242, 255, 1, 0
                If Parte2 > 1499 And Parte2 < 2000 Then AddtoRichTextBox frmMain.RecTxt, " <Rango: Diamante I> ", 186, 242, 255, 1, 0
                If Parte2 > 1999 Then AddtoRichTextBox frmMain.RecTxt, " <Challenger> ", 183, 237, 214, 1, 0
                
            End If

            Exit Sub

            'pluto:2.15
        Case "|,"                 ' >>>>> Mensajes Clan
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CO = Val(ReadField(2, Rdata, 180))
            
            AddtoRichTextBox frmMain.RecTxt2, ReadField(1, Rdata, 180), Val(FontTypes(CO).Red), Val(FontTypes(CO).Green), Val(FontTypes(CO).Blue), Val(FontTypes(CO).bold), Val(FontTypes(CO).italic)
               
            AddtoRichTextBox frmMain.RecTxt, ReadField(1, Rdata, 180), Val(FontTypes(CO).Red), Val(FontTypes(CO).Green), Val(FontTypes(CO).Blue), Val(FontTypes(CO).bold), Val(FontTypes(CO).italic)
               
            Exit Sub

            '--------------------------------------------
            'pluto:7.0
        Case "|*"                 ' >>>>> Mensajes comercio
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CO = Val(ReadField(2, Rdata, 180))
            AddtoRichTextBox frmMain.RecTxt3, ReadField(1, Rdata, 180), Val(FontTypes(CO).Red), Val(FontTypes(CO).Green), Val(FontTypes(CO).Blue), Val(FontTypes(CO).bold), Val(FontTypes(CO).italic)
            AddtoRichTextBox frmMain.RecTxt, ReadField(1, Rdata, 180), Val(FontTypes(CO).Red), Val(FontTypes(CO).Green), Val(FontTypes(CO).Blue), Val(FontTypes(CO).bold), Val(FontTypes(CO).italic)
            Exit Sub

        Case "º;"                 ' >>>>> Mensajes party
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CO = Val(ReadField(2, Rdata, 180))
            AddtoRichTextBox frmMain.RecTxt4, ReadField(1, Rdata, 180), Val(FontTypes(CO).Red), Val(FontTypes(CO).Green), Val(FontTypes(CO).Blue), Val(FontTypes(CO).bold), Val(FontTypes(CO).italic)
            AddtoRichTextBox frmMain.RecTxt, ReadField(1, Rdata, 180), Val(FontTypes(CO).Red), Val(FontTypes(CO).Green), Val(FontTypes(CO).Blue), Val(FontTypes(CO).bold), Val(FontTypes(CO).italic)
            Exit Sub

            'pluto:2.14
        Case "!;"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            iuser = Val(ReadField(3, Rdata, 176))
            Dim Parla(19) As String
            Dim nX        As Integer
            nX = RandomNumber(1, 19)
            Parla(1) = "Eh! rata de cloaca! afloja una botella de ron o te sacaré las tripas!!!"
            Parla(2) = "Que me lleven mil diablos si alguna vez vi algo tan asqueroso como fea vuestra estampa..."
            Parla(3) = "Voto a bríos... si fueras mi grumete te colgaría del palo de mesana..."
            Parla(4) = "...ahhh!, si aparece el capitán john silver te desollará sin compasión..."
            Parla(5) = "Voto al diablo que te trincharemos como a un pavo y entregaremos tus despojos a los indios"
            Parla(6) = "Rayos y centellas... ¿dónde diablos he dejado esa botella de ron?"
            Parla(7) = "Mil demonios... un bellaco como vos no vale ni de almuerzo para tiburones..."
            Parla(8) = "Enhoramala aparece vuesa merced, si le ve el capitán le quebrará la osamenta..."
            Parla(9) = "En esta isla empalamos sin piedad a los bribones como tú, así que ándate con ojo..."
            Parla(10) = "Sucia sabandija... ni siquiera regalado te querrían los caníbales de estas islas..."
            Parla(11) = "En verdad que si te quedas un rato más importunándome te despellejaré..."
            Parla(12) = "¡Largo de aquí tunante!...Seguro que me has robado mi botella de ron"
            Parla(13) = "Quince hombres van en el cofre del muerto, ¡ja, ja, ja, y una botella de ron!...El diablo y el ron se llevaron el resto, ¡ja, ja,ja, y una botella de ron!"
            Parla(14) = "El capitán john silver te agarrará el cogote y te rebanará el pescuezo como a un gorrino..."
            Parla(15) = "Que se pudra en los infiernos Ben Gunn que nos robó el tesoro al capitán y a mí..."
            Parla(16) = "Encomienda tu alma a lo que puedas porque te destripará el capitán john silver"
            Parla(17) = "Si no me devuelves mi ron te arrancaré la piel a tiras y la usaré de sucia alfombra"
            Parla(18) = "A los rufianes como vos les arrojamos por la borda sin encomendarnos a dios ni al diablo"
            Parla(19) = "En este mundo de World of AO no hay sitio para tí, dame mi ron y vuelve a tu estercolero..."
            
            Dialogos.CreateDialog Parla(nX), iuser, Val(ReadField(1, Rdata, 176))
            Exit Sub

        Case "!!"                ' >>>>> Msgbox :: !!
       
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            frmMensaje.msg.Caption = Rdata
            frmMensaje.Show vbModal

            Exit Sub

        Case "IU"                ' >>>>> Indice de Usuario en Server :: IU
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            UserIndex = Val(Rdata)
            Exit Sub

        Case "IP"                ' >>>>> Indice de Personaje de Usuario :: IP
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            UserCharIndex = Val(Rdata)
            UserPos = CharList(UserCharIndex).pos
            Exit Sub

        Case "CC"              ' >>>>> Crear un Personaje :: CC
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CharIndex = ReadField(4, Rdata, 44)
            x = ReadField(5, Rdata, 44)
            y = ReadField(6, Rdata, 44)
            
       
            With CharList(CharIndex)
                .Nombre = ReadField(12, Rdata, 44)
                .Criminal = Val(ReadField(13, Rdata, 44))
                .legion = 0    '
                .GM = Val(ReadField(14, Rdata, 44))    '

                If (.Criminal = 2) Then
                    .legion = 1
                    .Criminal = 0
                End If

                .Clan = ReadField(10, Rdata, 44)
                .NumParty = Val(ReadField(16, Rdata, 44))
                .Credito = Val(ReadField(17, Rdata, 44))
                .EsGoblin = Val(ReadField(18, Rdata, 44))
                .rReal = Val(ReadField(19, Rdata, 44))
                .LiderAlianza = ReadField(21, Rdata, 44)
                .LiderHorda = ReadField(22, Rdata, 44)
         
                Call MakeChar(CharIndex, ReadField(1, Rdata, 44), ReadField(2, Rdata, 44), ReadField(3, Rdata, 44), x, y, Val(ReadField(7, Rdata, 44)), Val(ReadField(8, Rdata, 44)), Val(ReadField(11, Rdata, 44)), Val(ReadField(15, Rdata, 44)), Val(ReadField(20, Rdata, 44)))
                Call SetCharacterFx(CharIndex, Val(ReadField(9, Rdata, 44)), 0)
                Call SetCharacterTag(CharIndex)
                
            End With
            
            Exit Sub

        Case "JX"              ' >>>>> Crear un npc :: JX
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CharIndex = ReadField(4, Rdata, 44)
            x = ReadField(5, Rdata, 44)
            y = ReadField(6, Rdata, 44)
      
            Call MakeChar(CharIndex, ReadField(1, Rdata, 44), ReadField(2, Rdata, 44), ReadField(3, Rdata, 44), x, y, Val(ReadField(7, Rdata, 44)), Val(ReadField(8, Rdata, 44)), Val(ReadField(11, Rdata, 44)), Val(ReadField(15, Rdata, 44)), Val(ReadField(20, Rdata, 44)))
            Call SetCharacterTag(CharIndex)
            Exit Sub

        Case "ZZ"
            Call frmConstruir.Show
            Exit Sub

        Case "X1"
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            For i = 1 To Val(ReadField(1, Rdata, 44))
                frmCanjes.ListaPremios.AddItem ReadField(i + 1, Rdata, 44)
            Next i

            frmCanjes.Show , frmMain
            Exit Sub

        Case "X2"    'Sistema de Canjeo - [Dylan.-] 2011...
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            With frmCanjes
                .Requiere.Caption = ReadField(1, Rdata, 44)
                .lAtaque.Caption = ReadField(3, Rdata, 44) & "/" & ReadField(2, Rdata, 44)
                .lDef.Caption = ReadField(5, Rdata, 44) & "/" & ReadField(4, Rdata, 44)
                .lAM.Caption = ReadField(7, Rdata, 44) & "/" & ReadField(6, Rdata, 44)
                .lDM.Caption = ReadField(9, Rdata, 44) & "/" & ReadField(8, Rdata, 44)
                .lDescripcion.Text = ReadField(10, Rdata, 44)
                .lPuntos.Caption = ReadField(11, Rdata, 44)

                If .Requiere.Caption = "0" Then
                    .Requiere.Caption = "N/A"

                End If

                If .lAtaque.Caption = "0/0" Then
                    .lAtaque.Caption = "N/A"

                End If

                If .lDef.Caption = "0/0" Then
                    .lDef.Caption = "N/A"

                End If

                If .lAM.Caption = "0/0" Then
                    .lAM.Caption = "N/A"

                End If

                If .lDM.Caption = "0/0" Then
                    .lDM.Caption = "N/A"

                End If
    
                .DrawCanje Val(ReadField(12, Rdata, 44))

            End With

            Exit Sub
        
        Case "X3"
                
            Rdata = Right$(Rdata, Len(Rdata) - 2)
               
            For i = 1 To Val(ReadField(1, Rdata, 44))
                frmDonaciones.ListaPremios.AddItem ReadField(i + 1, Rdata, 44)
            Next i
               
            frmDonaciones.Show , frmMain
            Exit Sub
               
        Case "A2" 'Sistema de Canjeo - [Dylan.-] 2011...
            Rdata = Right$(Rdata, Len(Rdata) - 2)
                
            With frmDonaciones
                .Requiere.Caption = ReadField(1, Rdata, 44)
                .lAtaque.Caption = ReadField(3, Rdata, 44) & "/" & ReadField(2, Rdata, 44)
                .lDef.Caption = ReadField(5, Rdata, 44) & "/" & ReadField(4, Rdata, 44)
                .lAM.Caption = ReadField(7, Rdata, 44) & "/" & ReadField(6, Rdata, 44)
                .lDM.Caption = ReadField(9, Rdata, 44) & "/" & ReadField(8, Rdata, 44)
                .lDescripcion.Text = ReadField(10, Rdata, 44)
                .lPuntos.Caption = ReadField(11, Rdata, 44)
                .lFoto.Picture = cLoadPicture(DirInterfaces & "" & ReadField(13, Rdata, 44) & ".jpg")
            
                If .Requiere.Caption = "0" Then
                    .Requiere.Caption = "N/A"

                End If

                If .lAtaque.Caption = "0/0" Then
                    .lAtaque.Caption = "N/A"

                End If

                If .lDef.Caption = "0/0" Then
                    .lDef.Caption = "N/A"

                End If

                If .lAM.Caption = "0/0" Then
                    .lAM.Caption = "N/A"

                End If

                If .lDM.Caption = "0/0" Then
                    .lDM.Caption = "N/A"

                End If
            
                Call .DrawDonacion(Val(ReadField(12, Rdata, 44)))

            End With

            Exit Sub

        Case "KO"
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CharIndex = Val(Rdata)
    
            'CharList(CharIndex).Arma.WeaponWalk(CharList(CharIndex).Heading).Started = 1
            'CharList(CharIndex).Escudo.ShieldWalk(CharList(CharIndex).Heading).Started = 1
            With CharList(CharIndex)
                Call InitGrh(.Arma.WeaponWalk(.Heading), .Arma.WeaponWalk(.Heading).GrhIndex, 1, False)
                Call InitGrh(.Escudo.ShieldWalk(.Heading), .Escudo.ShieldWalk(.Heading).GrhIndex, 1, False)
            
                .UsandoArma = True

            End With

            'CharList(CharIndex).UsandoArma = True
            'CharList(CharIndex).ArmaAnim = 7
            Exit Sub

        Case "BP"             ' >>>>> Borrar un Personaje :: BP
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            For k = 1 To Party.numMiembros

                If Party.Miembros(k).Index = Val(Rdata) Then
                    Party.Miembros(k).x = 0
                    Party.Miembros(k).y = 0

                End If

            Next
            'pluto:6.5
            Dim iIndex As Integer
            iIndex = Val(Rdata)

            If CharList(iIndex).pos.x = 0 Or CharList(iIndex).pos.y = 0 Then
                'AddtoRichTextBox frmMain.RecTxt, "Fallo BP: " & iIndex, 0, 0, 0, 1, 1
                MapData(x, y).CharIndex = 0
                Exit Sub

            End If

            Call EraseChar(Val(Rdata))
            Exit Sub

        Case "MP"             ' >>>>> Mover un Personaje :: MP
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CharIndex = Val(ReadField(1, Rdata, 44))

            If (Val(ReadField(4, Rdata, 44)) <> 1) Then
                Call DoPasosFx(CharIndex)
            End If

            Call MoveCharbyPos(CharIndex, ReadField(2, Rdata, 44), ReadField(3, Rdata, 44))
            Exit Sub

        Case "CP"             ' >>>>> Cambiar Apariencia Personaje :: CP
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            CharIndex = Val(ReadField(1, Rdata, 44))

            'pluto:6.5
            If CharIndex = 0 Then Exit Sub

            With CharList(CharIndex)

                If .pos.x = 0 Or CharList(CharIndex).pos.y = 0 Then
                    EraseChar (CharIndex)
                    Exit Sub
                End If
                
                .Heading = Val(ReadField(4, Rdata, 44))
                TempInt = Val(ReadField(2, Rdata, 44))

                If TempInt <> 0 Then
                    .iBody = TempInt
                    .Body = BodyData(TempInt)
                    .Aura(AuraBody.Cuerpo) = .Body.Aura
                Else
                    .iBody = 0
                    .Aura(AuraBody.Cuerpo) = 0
                End If
                
                TempInt = Val(ReadField(3, Rdata, 44))

                If TempInt <> 0 Then
                    .iHead = TempInt
                    .Head = HeadData(TempInt)
                    .Muerto = (TempInt = 500)
                Else
                    .iHead = 0
                End If
             
                TempInt = Val(ReadField(10, Rdata, 44))

                If TempInt <> 0 Then
                    .Botas = BotaData(TempInt)
                    .Aura(AuraBody.Botas) = .Botas.Aura
                Else
                    .Aura(AuraBody.Botas) = 0
                End If
               
                TempInt = Val(ReadField(11, Rdata, 44))

                If TempInt <> 0 Then
                    .Alas = AlasAnimData(TempInt)
                    .Aura(AuraBody.Alas) = .Alas.Aura
                Else
                    .Aura(AuraBody.Alas) = 0
                End If
            
                TempInt = Val(ReadField(5, Rdata, 44))

                If TempInt <> 0 Then
                    .Arma = WeaponAnimData(TempInt)
                    .Aura(AuraBody.Arma) = .Arma.Aura
                Else
                    .Aura(AuraBody.Arma) = 0
                End If

                TempInt = Val(ReadField(6, Rdata, 44))

                If TempInt <> 0 Then
                    .Escudo = ShieldAnimData(TempInt)
                    .Aura(AuraBody.Escudo) = .Escudo.Aura
                Else
                    .Aura(AuraBody.Escudo) = 0
                End If

                TempInt = Val(ReadField(9, Rdata, 44))

                If TempInt <> 0 Then
                    .Casco = CascoAnimData(TempInt)
                    .Aura(AuraBody.Casco) = .Casco.Aura
                Else
                    .Aura(AuraBody.Casco) = 0
                End If

                Dim RangeX As Single, RangeY As Single
                Call GetCharacterDimension(CharIndex, RangeX, RangeY)
                Call g_Swarm.Resize(CharIndex, RangeX, RangeY)
            End With

            Exit Sub

        Case "HO"            ' >>>>> Crear un Objeto

            Rdata = Right$(Rdata, Len(Rdata) - 2)
            x = Val(ReadField(2, Rdata, 44))
            y = Val(ReadField(3, Rdata, 44))
            
            'ID DEL OBJ EN EL CLIENTE
            With MapData(x, y)

                If (.ObjGrh.GrhIndex <> 0) Then
                    With GrhData(.ObjGrh.GrhIndex)
                        Call g_Swarm.Remove(QuadTree.LAYER_OBJ, -1, x, y, .TileWidth, .TileHeight)
                    End With
                End If
        
                .ObjGrh.GrhIndex = Val(ReadField(1, Rdata, 44))
              
                If (.ObjGrh.GrhIndex <> 0) Then
                    InitGrh .ObjGrh, .ObjGrh.GrhIndex, , IsGrhTree(.ObjGrh.GrhIndex)
              
                    With GrhData(.ObjGrh.GrhIndex)
                        Call g_Swarm.Insert(QuadTree.LAYER_OBJ, -1, x, y, .TileWidth, .TileHeight)
                    End With

                End If
            
            End With

            Exit Sub

        Case "BO"           ' >>>>> Borrar un Objeto
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            x = Val(ReadField(1, Rdata, 44))
            y = Val(ReadField(2, Rdata, 44))

            With GrhData(MapData(x, y).ObjGrh.GrhIndex)
                Call g_Swarm.Remove(QuadTree.LAYER_OBJ, -1, x, y, .TileWidth, .TileHeight)
            End With

            MapData(x, y).ObjGrh.GrhIndex = 0
            Exit Sub

        Case "BQ"           ' >>>>> Bloquear Posición
            Dim b As Byte
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            MapData(Val(ReadField(1, Rdata, 44)), Val(ReadField(2, Rdata, 44))).Blocked = Val(ReadField(3, Rdata, 44))
            Exit Sub

            'Case "TM"           ' >>>>> Play un MIDI :: TM
            'if Musica = 0 Then
            '   Rdata = Right$(Rdata, Len(Rdata) - 2)
            '  TempInt = Val(ReadField(1, Rdata, 45))
            
            ' If TempInt <> 0 Then
            '    Call Audio.StopMidi
            '   Call Audio.PlayMIDI(CStr(TempInt) & ".mid", Val(ReadField(2, Rdata, 45)))

            'End If

            'Exit Sub
        Case "TM"           'Reproduce MP3
            Dim mp3ant As Integer
            
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            TempInt = Val(ReadField(1, Rdata, 45))

            If TempInt <> 0 Or TempInt <> mp3ant Then
                Call Audio.MusicMP3Play(App.Path & "\recursos\MP3\" & TempInt & ".mp3") 'Play Mp3
                mp3ant = TempInt
            End If
            
            Exit Sub
            
        Case "TW"          ' >>>>> Play un WAV :: TW
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Call Audio.PlayWave(Rdata & ".wav")
            Exit Sub

            'pluto:6.0A
        Case "AW"          ' >>>>> Play un WAV asistente:: TW

            If Fasis = 1 Then
                Rdata = Right$(Rdata, Len(Rdata) - 2)
                Dim AST As String
                AST = Right$(Rdata, 2)

                If Val(AST) > 30 Then Rdata = "todos" & AST

                If Left$(Rdata, 5) = "curro" And Val(AST) > 15 Then Rdata = "curroestp"
                Call Audio.StopWave
                Call Audio.PlayWave(Rdata & ".wav")

            End If

            Exit Sub

        Case "GL"    'Lista de guilds
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Call frmGuildAdm.ParseGuildList(Rdata)
            Exit Sub

            'pluto:2.4
        Case "GX"    'Lista de guilds
            Rdata = Right$(Rdata, Len(Rdata) - 2)
            Call FrmPuntosClanes.PuntosGuildList(Rdata)
            Exit Sub

        Case "FO"          ' >>>>> Play un WAV :: TW
            bFogata = True

            '[CODE 001]:MatuX
            If IsPlaying <> plFogata Then
                If SoundFogataIndex > 0 Then Call Audio.StopWave(SoundFogataIndex)
                SoundFogataIndex = Audio.PlayWave("fuego.wav", True)
                IsPlaying = plFogata
            End If

            '[END]'
            Exit Sub

            'pluto:2.7.0
        Case "CU"
            Rdata = Right$(Rdata, Len(Rdata) - 2)

            If frmComerciarUsu.List1.ListCount > 0 Then frmComerciarUsu.List1.Clear

            If frmComerciarUsu.List2.ListCount > 0 Then frmComerciarUsu.List2.Clear
            
            For i = 1 To MAX_INVENTORY_SLOTS

                If Inventario.GrhIndex(i) <> 0 Then
                    frmComerciarUsu.List1.AddItem Inventario.Name(i)
                    frmComerciarUsu.List1.ItemData(frmComerciarUsu.List1.NewIndex) = Inventario.Amount(i)
                Else
                    frmComerciarUsu.List1.AddItem "Nada"
                    frmComerciarUsu.List1.ItemData(frmComerciarUsu.List1.NewIndex) = 0

                End If

            Next i

            Comerciando = True
            frmComerciarUsu.Show
            Exit Sub

        Case "CF"
            frmComerciarUsu.List1.Clear
            frmComerciarUsu.List2.Clear

            Unload frmComerciarUsu
            Comerciando = False
            Exit Sub

        Case "D1"
            Call RecibePremios(Rdata)
            Exit Sub

        Case "D2"
            frmFaccion.Show
            '   Call RecibePremios(Rdata)
            'Este lo manda para actualizar
            ' Case "DE"
            '    Call ActualizaPremios(Rdata)
            Exit Sub

        Case "QL"
            Call HandleQuestListSend(Rdata)
            Exit Sub

        Case "QI"
            Call HandleQuestDetails(Rdata)
            'Call HandleQuestDetailsMain(Rdata)
        
            Exit Sub
            '
    End Select

End Sub

Sub SendData(ByVal sdData As String)

    Dim tStr As String
    Dim AuxCmd As String
    
    AuxCmd = UCase$(Left$(sdData, 5))

    bO = bO + 1
    If bO > 10000 Then bO = 100

    'Agregamos el fin de linea
    sdData = ReadField(1, sdData, 1) & ENDC

    'pluto:6.0A
    'Para evitar el spamming
    If AuxCmd = "DEMSG" And Len(sdData) > 8000 Then
        Exit Sub
    Else
        GoTo sinp
    End If

    tStr = Left$(AuxCmd, 3)

    If tStr <> "PSS" And tStr <> "BO9" And tStr <> "BO8" And tStr <> "TA1" And tStr <> "BO5" And tStr <> "XSX" Then
        If Len(sdData) > 300 Then Exit Sub
    End If

sinp:

    'pluto:2.4.5
    If Left$(sdData, 13) = "gIvEmEvAlcOde" Or Left$(sdData, 1) = Chr$(6) Then GoTo nop    'Or Left$(sdData, 3) = "PSS" Then GoTo nop

    KeyCodi = Keycodi2
    sdData = CodificaR(KeyCodi, sdData, 1)

nop:

   Call frmMain.Socket1.Write(sdData, Len(sdData))

End Sub

Sub Login(ByVal valcode As Integer)

    Dim hash As String
    Dim Ver  As String

    If frmRecuperarCuenta.Visible Then

        If CheckMailString(frmRecuperarCuenta.Text1) Then
            Call SendData(Chr$(9) & frmRecuperarCuenta.Text1 & "," & valcode)
        Else
            MsgBox "Por favor escriba correctamente la direccion de correo."
            frmMain.Socket1.Disconnect

        End If

        Exit Sub

    End If

    If frmCrearCuenta.Visible Then

        If CheckMailString(frmCrearCuenta.Text1) Then
            Call SendData(Chr$(8) & frmCrearCuenta.Text1 & "," & valcode & "," & frmCrearCuenta.Text2)
        Else
            Call MsgBox("Por favor verifique que la direccon de correo es correcta")
            frmMain.Socket1.Disconnect

        End If

        Exit Sub

    End If

    'JUGADOR
    'pluto:6.7
    Usercuenta = UserName
    'Lusercuenta = Len(Usercuenta)
    'If Lusercuenta > 30 Then Lusercuenta = 30
    Ver = "cbb6718974a24ccefef85c67fafee6f1d9e222c25v9"

    If SendNewChar = False Then SendData (Chr$(6) & EncriptaString(UserName & "," & UserPassword & "," & Ver & "," & valcode))

    If SendNewChar = True Then
        Dim i As Byte

        For i = 1 To NUMSKILLS
            UserSkills(i) = 0
        Next i


        'pluto:2.4.7 encriptar
        'pluto:7.0 añada userporcentajes
        SendData ("NLOGIN" & EncriptaString(UserName & "," & UserPassword & "," & 0 & "," & 0 & "," & f1 & "." & f2 & "." & f3 & "," & UserRaza & _
                "," & UserSexo & "," & UserClase & "," & UserAtributos(1) & "," & UserAtributos(2) & "," & UserAtributos(3) & "," & UserAtributos( _
                4) & "," & UserAtributos(5) & "," & UserSkills(1) & "," & UserSkills(2) & "," & UserSkills(3) & "," & UserSkills(4) & "," & _
                UserSkills(5) & "," & UserSkills(6) & "," & UserSkills(7) & "," & UserSkills(8) & "," & UserSkills(9) & "," & UserSkills(10) & "," _
                & UserSkills(11) & "," & UserSkills(12) & "," & UserSkills(13) & "," & UserSkills(14) & "," & UserSkills(15) & "," & UserSkills(16) _
                & "," & UserSkills(17) & "," & UserSkills(18) & "," & UserSkills(19) & "," & UserSkills(20) & "," & UserSkills(21) & "," & _
                UserSkills(22) & "," & UserSkills(23) & "," & UserSkills(24) & "," & UserSkills(25) & "," & UserSkills(26) & "," & UserSkills(27) & _
                "," & UserSkills(28) & "," & UserSkills(29) & "," & UserSkills(30) & "," & UserSkills(31) & "," & UserEmail & "," & UserHogar & "," _
                & totalda & "," & UserPorcentajes(1) & "," & UserPorcentajes(2) & "," & UserPorcentajes(3) & "," & UserPorcentajes(4) & "," & _
                UserPorcentajes(5) & "," & UserPorcentajes(6) & "," & valcode & "," & UserHead & "," & UserBody))

    End If

End Sub

Public Function des(n As Integer, key As Integer, CRC As Integer) As Long

    On Error GoTo end1

    Dim crypt As Long

    crypt = n Xor key
    crypt = crypt Xor CRC
    crypt = crypt Xor 735

    des = crypt

    'pluto:2.5.0
    KeyCodi = " " & des
    Keycodi2 = KeyCodi
    Exit Function
end1:
    des = 0

End Function

Public Sub RecibePremios(Rdata As String)

    Dim n As Integer

    'Select Case Left(Rdata, 2)

    '   Case "D1"
    Rdata = Right$(Rdata, Len(Rdata) - 2)

    For n = 1 To 34

        Premios.MataNPCs(n) = Val(ReadField(n, Rdata, 44))

    Next

    ' Case "D2"
    '    Rdata = Right$(Rdata, Len(Rdata) - 2)

    '   For n = 1 To 16

    '      Premios.MataNPCs(n) = Val(ReadField(n, Rdata, 44))

    ' Next

    'End Select
    FrmPremios.Show , frmMain

End Sub
