Attribute VB_Name = "modHechizos"
Option Explicit

Sub NpcLanzaSpellSobreUser(ByVal NpcIndex As Integer, _
                           ByVal Userindex As Integer, _
                           ByVal Spell As Integer)

    On Error GoTo fallo

    If Npclist(NpcIndex).CanAttack = 0 Then Exit Sub
    If UserList(Userindex).flags.Muerto = 1 Then Exit Sub
    If UserList(Userindex).flags.Invisible = 1 And Npclist(NpcIndex).flags.Magiainvisible = 0 Then Exit Sub
    If UserList(Userindex).flags.AdminInvisible = 1 Then Exit Sub

    'pluto:2.20
    'If Hechizos(Spell).Noesquivar = 1 Then GoTo noesq

    'pluto:6.0A skill
    'Dim oo As Byte
    'oo = RandomNumber(1, 100)
    'Call SubirSkill(UserIndex, EvitaMagia)
    'If oo < CInt((UserList(UserIndex).Stats.UserSkills(EvitaMagia) / 10) + 2) Then
    'Call SendData(ToIndex, UserIndex, 0, "|| Has Resistido una Magia !!" & FONTTYPENAMES.FONTTYPE_fight)
    'Exit Sub
    'End If
    '--------------------
noesq:

    'pluto:6.0A
    If Npclist(NpcIndex).Raid > 0 Then
        Dim oo As Byte
        oo = RandomNumber(1, 100)

        If oo > 95 Then Spell = 69

    End If

    Npclist(NpcIndex).CanAttack = 0
    Dim daño As Integer

    'pluto:6.0A----------------------------------------------
    If Npclist(NpcIndex).Anima = 1 Then
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 94, Npclist(NpcIndex).Char.CharIndex & "," & _
                                                                             Npclist(NpcIndex).Char.Heading)

    End If

    '--------------------------------------------------------
    If Hechizos(Spell).SubeHP = 1 Then

        daño = RandomNumber(Hechizos(Spell).MinHP, Hechizos(Spell).MaxHP)
        'If UserList(userindex).raza = "Enano" Then daño = daño - CInt(daño / 5)
        'If UserList(userindex).raza = "Humano" Then daño = daño - CInt(daño / 10)

        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Hechizos(Spell).WAV)
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," _
                                                                             & Hechizos(Spell).FXgrh & "," & Hechizos(Spell).loops)

        'pluto:2.4
        Call AddtoVar(UserList(Userindex).Stats.MinHP, Porcentaje(UserList(Userindex).Stats.MaxHP, 15), UserList( _
                                                                                                        Userindex).Stats.MaxHP)
        Call SendData(ToIndex, Userindex, 0, "V1")
        Call senduserstatsbox(Userindex)

    ElseIf Hechizos(Spell).SubeHP = 2 Then
        daño = RandomNumber(Hechizos(Spell).MinHP, Hechizos(Spell).MaxHP)

        'pluto:7.0 extra monturas subido arriba
        If UserList(Userindex).flags.Montura = 1 Then
            'Dim kk As Integer
            'Dim oo As Integer
            Dim nivk As Integer
            oo = UserList(Userindex).flags.ClaseMontura
            'kk = 0
            'If oo = 1 Then kk = 2
            'If oo = 5 Then kk = 3
            nivk = UserList(Userindex).Montura.Nivel(oo)
            daño = daño - CInt(Porcentaje(daño, UserList(Userindex).Montura.DefMagico(oo))) - 1

            'daño = daño - CInt(Porcentaje(daño, nivk * PMascotas(oo).ReduceMagia)) - 1
            If daño < 1 Then daño = 1

        End If

        '------------fin pluto:2.4-------------------
        'pluto:2.18
        daño = daño - CInt(Porcentaje(daño, UserList(Userindex).UserDefensaMagiasRaza))

        ' If UserList(UserIndex).raza = "Elfo" Then daño = daño - CInt(Porcentaje(daño, 8))
        'If UserList(UserIndex).raza = "Humano" Then daño = daño - CInt(Porcentaje(daño, 5))
        'If UserList(UserIndex).raza = "Gnomo" Then daño = daño - CInt(Porcentaje(daño, 15))
        ' If UserList(UserIndex).raza = "Elfo Oscuro" Then daño = daño - CInt(Porcentaje(daño, 5))

        'pluto:6.0A Skills
        'daño = daño - CInt(Porcentaje(daño, (CInt(UserList(UserIndex).Stats.UserSkills(DefMagia) / 10))))
        'Call SubirSkill(UserIndex, DefMagia)
        '-------------------

        'pluto:2.16
        If UserList(Userindex).flags.Protec > 0 Then daño = daño - CInt(Porcentaje(daño, UserList( _
                                                                                         Userindex).flags.Protec))

        'pluto:7.0
        If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
            daño = daño - ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex).Defmagica

            If daño < 1 Then daño = 1

        End If

        'pluto:2.4.1
        Dim obj As ObjData

        If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
            If ObjData(UserList(Userindex).Invent.AnilloEqpObjIndex).SubTipo = 4 Then daño = daño - CInt(daño / 30)

        End If

        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Hechizos(Spell).WAV)
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," _
                                                                             & Hechizos(Spell).FXgrh & "," & Hechizos(Spell).loops)

        If UserList(Userindex).flags.Privilegios = 0 Then UserList(Userindex).Stats.MinHP = UserList( _
           Userindex).Stats.MinHP - daño

        Call SendData(ToIndex, Userindex, 0, "||" & Npclist(NpcIndex).Name & " te ha quitado " & daño & _
                                             " puntos de vida." & "´" & FontTypeNames.FONTTYPE_FIGHT)

        'EZE BERSERKER
        Dim Lele As Integer
        Lele = UserList(Userindex).Stats.MaxHP / 3



        If UserList(Userindex).Stats.MinHP < Lele And UserList(Userindex).raza = "Enano" Then

            'daño = daño * 1.5
            'Debug.Print daño

            'Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList( _
                                                                                 Userindex).Char.CharIndex & "´" & Hechizos(42).FXgrh & "´" & Hechizos(25).loops)
            Call SendData(ToIndex, Userindex, 0, "||¡¡¡¡¡ HAS ENTRADO EN BERSERKER !!!!!!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If
        
            Dim bup As Byte
        If UserList(Userindex).raza = "Vampiro" Then
            
            bup = RandomNumber(1, 10)
            'Debug.Print bup
        If bup > 1 Then
            
                'Debug.Print UserList(Userindex).Stats.MinHP & "Antes"
                UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MinHP + Porcentaje(UserList(Userindex).Stats.MaxHP, 15)
                'Debug.Print UserList(Userindex).Stats.MinHP & "Despues"
            
        If UserList(Userindex).Stats.MinHP > UserList(Userindex).Stats.MaxHP Then UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP

            End If
            End If
        
        'pluto:7.0 10% quedar 1 vida en ciclopes
        If UserList(Userindex).Stats.MinHP < 1 And UserList(Userindex).raza = "Abisario" Then
            'Dim bup As Byte
            bup = RandomNumber(1, 10)

            If bup = 8 Then UserList(Userindex).Stats.MinHP = 1

        End If

        Call SendUserStatsVida(Userindex)

        'Muere
        If UserList(Userindex).Stats.MinHP < 1 Then
            UserList(Userindex).Stats.MinHP = 0
            'pluto:7.0 añado aviso de muerte
            Call SendData(ToIndex, Userindex, 0, "6")

            Call UserDie(Userindex)

        End If

    End If

    'pluto:2.4

    If Hechizos(Spell).SubeMana = 1 Then
        'Call SendData(ToPCArea, userindex, UserList(userindex).pos.Map, "TW" & Hechizos(Spell).WAV)
        'Call SendData(ToPCArea, userindex, UserList(userindex).pos.Map, "CFX" & UserList(userindex).Char.CharIndex & "," & Hechizos(Spell).FXgrh & "," & Hechizos(Spell).loops)
        Call AddtoVar(UserList(Userindex).Stats.MinMAN, Porcentaje(UserList(Userindex).Stats.MaxMAN, 15), UserList( _
                                                                                                          Userindex).Stats.MaxMAN)
        Call SendData(ToIndex, Userindex, 0, "V4")
        Call senduserstatsbox(Userindex)

    End If
    
    If Hechizos(Spell).Paraliza = 1 And UserList(Userindex).flags.Paralizado = 1 Then Exit Sub

    '-----fin pluto:2.4------------------
    If Hechizos(Spell).Paraliza = 1 Then
        If UserList(Userindex).flags.Paralizado = 0 Then
            UserList(Userindex).flags.Paralizado = 1
            Call SendData2(ToIndex, Userindex, 0, 117)
            'pluto:7.0

                UserList(Userindex).Counters.Paralisis = IntervaloParalisisPJ

            End If

            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Hechizos(Spell).WAV)
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & _
                                                                                 "," & Hechizos(Spell).FXgrh & "," & Hechizos(Spell).loops)

            Call SendData2(ToIndex, Userindex, 0, 68)
            Call SendData2(ToIndex, Userindex, 0, 15, UserList(Userindex).Pos.X & "," & UserList(Userindex).Pos.Y)
            Dim rt As Integer
            rt = RandomNumber(1, 100)

            'If UserList(UserIndex).clase = "DRUIDA" And rt > 80 Then UserList(UserIndex).Counters.Paralisis = 0
            'pluto:7.0
            If UserList(Userindex).raza = "Goblin" And rt < 15 Then UserList(Userindex).Counters.Paralisis = 0

            'pluto:2.4.1
            If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
                If ObjData(UserList(Userindex).Invent.AnilloEqpObjIndex).SubTipo = 3 And rt > 80 Then
                    UserList(Userindex).Counters.Paralisis = 0
                    Call SendData(ToIndex, Userindex, 0, "||Anillo impide parálisis" & "´" & _
                                                         FontTypeNames.FONTTYPE_VENENO)

                End If

            End If

        End If

    

    'ceguera
    If Hechizos(Spell).Ceguera = 1 Then

        'pluto:2.10
        'nati: agrego el "Not UserList(UserIndex).flags.Morph = 214" para que no le afecte la ceguera al berserker
        If UserList(Userindex).flags.Ceguera = 0 And UCase(UserList(Userindex).clase) <> "BARDO" And UserList( _
           Userindex).flags.Angel = 0 And UserList(Userindex).flags.Demonio = 0 And Not UserList( _
           Userindex).flags.Morph = 214 Then
            UserList(Userindex).flags.Ceguera = 1
            UserList(Userindex).Counters.Ceguera = Intervaloceguera
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Hechizos(Spell).WAV)

            Call SendData2(ToIndex, Userindex, 0, 2)

        End If

    End If

    'estupidez
    If Hechizos(Spell).Estupidez = 1 Then

        'pluto:2.11
        'nati: agrego el "Not UserList(UserIndex).flags.Morph = 214" para que lo ne afecte la estupidez
        If UserList(Userindex).flags.Estupidez = 0 And UCase(UserList(Userindex).clase) <> "BARDO" And UserList( _
           Userindex).flags.Angel = 0 And UserList(Userindex).flags.Demonio = 0 And UserList( _
           Userindex).flags.Montura = 0 And Not UserList(Userindex).flags.Morph = 214 Then
            UserList(Userindex).flags.Estupidez = 1
            UserList(Userindex).Counters.Estupidez = Intervaloceguera
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Hechizos(Spell).WAV)
            Call SendData2(ToIndex, Userindex, 0, 3)

        End If

    End If

    'veneno
    If Hechizos(Spell).Envenena > 1 Then

        '[Tite]Añado la condicion de que no sea bardo el pj  y que no este muerto
        If UserList(Userindex).flags.Envenenado = 0 And UserList(Userindex).flags.Muerto = 0 And UCase(UserList( _
                                                                                                       Userindex).clase) <> "BARDO" Then
            'If UserList(UserIndex).flags.Envenenado = 0 Then
            UserList(Userindex).flags.Envenenado = Hechizos(Spell).Envenena
            UserList(Userindex).Counters.veneno = IntervaloVeneno
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Hechizos(Spell).WAV)
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & _
                                                                                 "," & Hechizos(Spell).FXgrh & "," & Hechizos(Spell).loops)

        End If

    End If

    'pluto:2.4
    'fuerza npc
    If Hechizos(Spell).SubeFuerza > 0 Then
        If Not UserList(Userindex).raza = "asd" Then

            'pluto:2.15
            If UserList(Userindex).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, Userindex, 0, "S1")

            End If

            daño = RandomNumber(Hechizos(Spell).MinFuerza, Hechizos(Spell).MaxFuerza)
            UserList(Userindex).flags.DuracionEfecto = 1200
            Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Fuerza), daño, UserList( _
                                                                                 Userindex).Stats.UserAtributosBackUP(Fuerza) + 13)
            UserList(Userindex).flags.TomoPocion = True
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Hechizos(Spell).WAV)
            Call SendData(ToIndex, Userindex, 0, "V2")

            'b = True
        End If

    End If

    'agilidad npc
    If Hechizos(Spell).SubeAgilidad > 0 Then
        If Not UserList(Userindex).raza = "Elfo Oscuro" Then

            'pluto:2.15
            If UserList(Userindex).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, Userindex, 0, "S1")

            End If

            daño = RandomNumber(Hechizos(Spell).MinAgilidad, Hechizos(Spell).MaxAgilidad)
            UserList(Userindex).flags.DuracionEfecto = 1200
            Call AddtoVar(UserList(Userindex).Stats.UserAtributos(Agilidad), daño, UserList( _
                                                                                   Userindex).Stats.UserAtributosBackUP(Agilidad) + 13)
            UserList(Userindex).flags.TomoPocion = True
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Hechizos(Spell).WAV)
            Call SendData(ToIndex, Userindex, 0, "V3")
            'Call SendData(ToIndex, Userindex, 0, "INVI")

            'b = True
        End If

    End If

    Exit Sub
fallo:
    Call LogError("npclanzaspellsobreuser " & Npclist(NpcIndex).Name & "->" & Spell & " " & Err.number & " D: " & _
                  Err.Description)

End Sub

Function TieneHechizo(ByVal i As Integer, ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    Dim J As Integer

    For J = 1 To MAXUSERHECHIZOS

        If UserList(Userindex).Stats.UserHechizos(J) = i Then
            TieneHechizo = True
            Exit Function

        End If

    Next

    Exit Function
fallo:
    Call LogError("tienehechizo " & Err.number & " D: " & Err.Description)

End Function

Sub AgregarHechizo(ByVal Userindex As Integer, ByVal Slot As Integer)

    On Error GoTo fallo

    Dim hindex As Integer
    Dim J As Integer
    Dim pero As Byte
    hindex = ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).HechizoIndex

    If Not TieneHechizo(hindex, Userindex) Then

        'Buscamos un slot vacio
        For J = 1 To MAXUSERHECHIZOS

            If UserList(Userindex).Stats.UserHechizos(J) = 0 Then Exit For
        Next J

        pero = 4

        If UserList(Userindex).Stats.UserHechizos(J) <> 0 Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes espacio para mas hechizos." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
        Else
            UserList(Userindex).Stats.UserHechizos(J) = hindex
            Call UpdateUserHechizos(False, Userindex, CByte(J))
            'pluto:2.17
            pero = 5

            If UserList(Userindex).Faccion.ArmadaReal = 1 Then
                Dim n As Long
                pero = 6
                n = Porcentaje(ObjData(UserList(Userindex).Invent.Object(Slot).ObjIndex).Valor, 20)
                Call AddtoVar(UserList(Userindex).Stats.GLD, n, MAXORO)
                Call SendData(ToIndex, Userindex, 0, "||El Rey del Imperio te proporciona " & n & _
                                                     " Monedas de Oro para ayudarte en los gastos ocasionados por la compra de ese Hechizo. " & _
                                                     "´" & FontTypeNames.FONTTYPE_INFO)
                Call SendUserStatsOro(Userindex)

            End If

            '-------
            pero = 7
            'Quitamos del inv el item
            Call QuitarUserInvItem(Userindex, CByte(Slot), 1)

        End If

    Else
        pero = 8
        Call SendData(ToIndex, Userindex, 0, "||Ya tienes ese hechizo." & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    Exit Sub
fallo:
    Call LogError("agregarhechizo: " & UserList(Userindex).Name & " " & hindex & " Señal: " & pero & " D: " & _
                  Err.Description)

End Sub

Sub AgregarHechizoangel(ByVal Userindex As Integer, ByVal hindex As Integer)

    On Error GoTo fallo

    Dim J As Integer

    If Not TieneHechizo(hindex, Userindex) Then

        'Buscamos un slot vacio
        For J = 1 To MAXUSERHECHIZOS

            If UserList(Userindex).Stats.UserHechizos(J) = 0 Then Exit For
        Next J

        If UserList(Userindex).Stats.UserHechizos(J) <> 0 Then
            Call SendData(ToIndex, Userindex, 0, "||No tenes espacio para mas hechizos." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
        Else
            UserList(Userindex).Stats.UserHechizos(J) = hindex
            Call UpdateUserHechizos(False, Userindex, CByte(J))

        End If

    Else
        Call SendData(ToIndex, Userindex, 0, "||Ya tenes ese hechizo." & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    Exit Sub
fallo:
    Call LogError("agregarhechizoangel " & Err.number & " D: " & Err.Description)

End Sub

Sub DecirPalabrasMagicas(ByVal S As String, ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim ind As String
    ind = UserList(Userindex).Char.CharIndex
    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||7°" & S & "°" & ind)

    Exit Sub
fallo:
    Call LogError("decirpalabrasmagicas " & Err.number & " D: " & Err.Description)

End Sub

Function PuedeLanzar(ByVal Userindex As Integer, ByVal HechizoIndex As Integer) As Boolean

    On Error GoTo fallo

    'pluto
    If HechizoIndex = 0 Then Exit Function

    If UserList(Userindex).flags.Muerto = 0 Then
        Dim wp2 As WorldPos
        wp2.Map = UserList(Userindex).flags.TargetMap
        wp2.X = UserList(Userindex).flags.TargetX
        wp2.Y = UserList(Userindex).flags.TargetY

        'pluto:2.14
        If UserList(Userindex).Pos.Map <> wp2.Map Then
            Call SendData(ToIndex, Userindex, 0, "||No seas tramposo " & UserList(Userindex).Name & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Call LogCasino(UserList(Userindex).Name & " IP:" & UserList(Userindex).ip & _
                           " trato de lanzar un spell desde otro mapa -> " & UserList(Userindex).Pos.Map & " / " & wp2.Map)
            Exit Function

        End If

        'pluto:6.0A
        If UserList(Userindex).flags.Hambre > 0 Or UserList(Userindex).flags.Sed > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Demasiado hambriento o sediento para poder atacar!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Function

        End If
        
        'Debug.Print Distancia(UserList(Userindex).Pos, wp2)

        If Distancia(UserList(Userindex).Pos, wp2) > 20 Then
            'UserList(UserIndex).Flags.AdministrativeBan = 1
            Call SendData(ToIndex, Userindex, 0, "||No seas tramposo " & UserList(Userindex).Name & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            'Call LogHackAttemp(UserList(UserIndex).Name & " IP:" & UserList(UserIndex).ip & " trato de lanzar un spell desde otro mapa.")
            'Call CloseSocket(UserIndex)
            Exit Function

        End If

        '-------fin pluto:2.14--------------
        
            If UserList(Userindex).raza = "Humano" And HechizoIndex = 10 And UserList(Userindex).Stats.MinMAN > 150 Then
            PuedeLanzar = True
            Exit Function
            End If
            
            If UserList(Userindex).raza = "NoMuerto" And HechizoIndex = 9 And UserList(Userindex).Stats.MinMAN > 225 Then
            PuedeLanzar = True
            Exit Function
            End If

        If UserList(Userindex).Stats.MinMAN >= Hechizos(HechizoIndex).ManaRequerido Then
            If UserList(Userindex).Stats.UserSkills(Magia) >= Hechizos(HechizoIndex).MinSkill Then
                PuedeLanzar = (UserList(Userindex).Stats.MinSta > 0)
            Else
                Call SendData(ToIndex, Userindex, 0, _
                              "||No tienes suficientes puntos en la habilidad APRENDIZAJE DE ARTES MAGICAS para lanzar este hechizo." _
                              & "´" & FontTypeNames.FONTTYPE_INFO)
                PuedeLanzar = False

            End If

        Else
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente mana." & "´" & FontTypeNames.FONTTYPE_INFO)
            PuedeLanzar = False

        End If

    Else
        Call SendData(ToIndex, Userindex, 0, "L3")
        PuedeLanzar = False

    End If

    Dim H As Integer

    H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)

    ' pluto:6.0A Restricciones por nivel
    If Hechizos(H).MinNivel > UserList(Userindex).Stats.ELV Then
        Call SendData(ToIndex, Userindex, 0, "||Necesitas nivel " & Hechizos(H).MinNivel & _
                                             " para poder lanzar este hechizo." & "´" & FontTypeNames.FONTTYPE_INFO)
        PuedeLanzar = False

    End If

    ' solo angeles
    If (H = 37 Or H = 38) And UserList(Userindex).flags.Angel = 0 Then
        Call SendData(ToIndex, Userindex, 0, "||No eres Angel" & "´" & FontTypeNames.FONTTYPE_INFO)
        PuedeLanzar = False

    End If

    ' solo demonios
    If (H = 53 Or H = 52) And UserList(Userindex).flags.Demonio = 0 Then
        Call SendData(ToIndex, Userindex, 0, "||No eres Demonio" & "´" & FontTypeNames.FONTTYPE_INFO)
        PuedeLanzar = False

    End If

    Exit Function
fallo:
    Call LogError("puedelanzar " & Err.number & " D: " & Err.Description)

End Function

Sub HechizoTerrenoEstado(ByVal Userindex As Integer, ByRef b As Boolean)
    Dim PosCasteadaX As Integer
    Dim PosCasteadaY As Integer
    Dim PosCasteadaM As Integer
    Dim H As Integer
    Dim TempX As Integer
    Dim TempY As Integer
    Dim TU As Integer
    TU = UserList(Userindex).flags.TargetUser
    PosCasteadaX = UserList(Userindex).flags.TargetX
    PosCasteadaY = UserList(Userindex).flags.TargetY
    PosCasteadaM = UserList(Userindex).flags.TargetMap

    H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)

    'IRON AO: Remover Invisibilidad
    '  If Hechizos(H).RemueveInvisibilidadParcial = 1 Then
    '      b = True
    '     For TempX = PosCasteadaX - 8 To PosCasteadaX + 8
    '        For TempY = PosCasteadaY - 8 To PosCasteadaY + 8
    '           If InMapBounds(PosCasteadaM, TempX, TempY) Then
    '              If MapData(PosCasteadaM, TempX, TempY).UserIndex > 0 Then
    '                 'hay un user
    '                If MapData(PosCasteadaM, TempX, TempY).UserIndex <> UserIndex And UserList(MapData(PosCasteadaM, TempX, TempY).UserIndex).flags.Invisible = 1 And UserList(MapData(PosCasteadaM, TempX, TempY).UserIndex).flags.AdminInvisible = 0 Then
    '                   UserList(MapData(PosCasteadaM, TempX, TempY).UserIndex).flags.Invisible = 0
    '                  UserList(MapData(PosCasteadaM, TempX, TempY).UserIndex).Counters.Invisibilidad = 0
    '         Call SendData2(ToMap, 0, PosCasteadaM, 16, UserList(MapData(PosCasteadaM, TempX, TempY).UserIndex).Char.CharIndex & ",0")
    '        Call SendData2(ToIndex, UserIndex, 0, 16, UserList(MapData(PosCasteadaM, TempX, TempY).UserIndex).Char.CharIndex & ",0")
    '               Call SendData(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, "CFX" & UserList(MapData(PosCasteadaM, TempX, TempY).UserIndex).Char.CharIndex & "," & Hechizos(55).FXgrh & "," & Hechizos(55).loops)
    '              Call SendData2(ToMap, 0, UserList(UserIndex).Pos.Map, 16, UserList(UserIndex).Char.CharIndex & ",0")
    '         End If
    '             End If
    '        End If
    '        Next TempY
    '   Next TempX
    '  End If
End Sub

Sub HechizoInvocacion(ByVal Userindex As Integer, ByRef b As Boolean)

    On Error GoTo fallo

    'Call LogTarea("HechizoInvocacion")
    If UserList(Userindex).NroMacotas >= MAXMASCOTAS Then Exit Sub
    'pluto:2.17
    'If MapInfo(UserList(UserIndex).Pos.Map).Terreno = "CONQUISTA" Then
    'Call SendData(ToIndex, UserIndex, 0, "||No puedes en este Mapa!!." & FONTTYPENAMES.FONTTYPE_TALK)
    'Exit Sub
    'End If

    If UserList(Userindex).Pos.Map = 34 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes invocar Mascotas en este Mapa." & "´" & _
                                             FontTypeNames.FONTTYPE_talk)
        Exit Sub

    End If

    'pluto:6.0A
    If MapInfo(UserList(Userindex).Pos.Map).Mascotas = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes invocar Mascotas en este Mapa." & "´" & _
                                             FontTypeNames.FONTTYPE_talk)
        Exit Sub

    End If

    Dim H As Integer, J As Integer, ind As Integer, index As Integer
    Dim TargetPos As WorldPos

    TargetPos.Map = UserList(Userindex).flags.TargetMap
    TargetPos.X = UserList(Userindex).flags.TargetX
    TargetPos.Y = UserList(Userindex).flags.TargetY

    H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)

    For J = 1 To Hechizos(H).Cant

        If UserList(Userindex).NroMacotas < MAXMASCOTAS Then
            ind = SpawnNpc(Hechizos(H).NumNpc, TargetPos, True, False)

            'pluto:2.4
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
                'pluto:mas duracion mascotas cutres

                If UCase$(Hechizos(H).Nombre) = "INVOCAR HADA" Or UCase$(Hechizos(H).Nombre) = "INVOCAR GENIO" Then _
                   IntervaloInvocacion = 1200
                Npclist(ind).Contadores.TiempoExistencia = IntervaloInvocacion
                Npclist(ind).GiveGLD = 0

                Call FollowAmo(ind)

            End If

        Else
            Exit For

        End If

    Next J

    Call InfoHechizo(Userindex)
    b = True

    Exit Sub
fallo:
    Call LogError("hechizoinvocacion " & Err.number & " D: " & Err.Description)

End Sub

Sub HandleHechizoTerreno(ByVal Userindex As Integer, ByVal uh As Integer)

    On Error GoTo fallo

    Dim b As Boolean

    Select Case Hechizos(uh).Tipo

    Case uInvocacion    '
        Call HechizoInvocacion(Userindex, b)

    Case uEstado
        Call HechizoTerrenoEstado(Userindex, b)

    End Select

    If b Then
        Call SubirSkill(Userindex, Magia)

        'If Hechizos(uh).Resis = 1 Then Call SubirSkill(UserList(UserIndex).Flags.TargetUser, Resis)
        'pluto:7.0 menos mana elfos
        
            UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN - Hechizos(uh).ManaRequerido
            
            
            If UserList(Userindex).raza = "Elfo" Then
            Dim bup As Byte
            bup = RandomNumber(1, 10)
            'Debug.Print bup
            If bup = 8 Then
            
                'Debug.Print UserList(Userindex).Stats.MinMAN & "Antes"
                UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN + Porcentaje(UserList(Userindex).Stats.MaxMAN, 15)
                'Debug.Print UserList(Userindex).Stats.MinMAN & "Despues"
            
            If UserList(Userindex).Stats.MinMAN > UserList(Userindex).Stats.MaxMAN Then UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MaxMAN

            End If
            End If

        'pluto:6.9
        If UserList(Userindex).flags.Privilegios > 0 Then UserList(Userindex).Stats.MinMAN = UserList( _
           Userindex).Stats.MaxMAN

        'pluto:6.5----------------
        Dim obj As ObjData

        If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
            If ObjData(UserList(Userindex).Invent.AnilloEqpObjIndex).SubTipo = 8 Then
                Call AddtoVar(UserList(Userindex).Stats.MinMAN, Porcentaje(Hechizos(uh).ManaRequerido, 20), UserList( _
                                                                                                            Userindex).Stats.MaxMAN)

            End If

        End If

        '----------------------------

        If UserList(Userindex).Stats.MinMAN < 0 Then UserList(Userindex).Stats.MinMAN = 0
        Call SendUserStatsMana(Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("handlehechizoterreno " & Err.number & " D: " & Err.Description)

End Sub

Sub HandleHechizoUsuario(ByVal Userindex As Integer, ByVal uh As Integer)

    On Error GoTo fallo

    Dim b As Boolean

    Select Case Hechizos(uh).Tipo

    Case uEstado    ' Afectan estados (por ejem : Envenenamiento)
        Call HechizoEstadoUsuario(Userindex, b)

    Case uPropiedades    ' Afectan HP,MANA,STAMINA,ETC

        'IRON AO: No puedes atacar INVISIBLE
        'If UserList(UserIndex).flags.Invisible = 1 Then
        'Call SendData(ToIndex, UserIndex, 0, "||No puedes atacar Invisible." & "´" & FontTypeNames.FONTTYPE_info)
        'Exit Sub
        'End If
        Call HechizoPropUsuario(Userindex, b)

    End Select

    If b Then
        Call SubirSkill(Userindex, Magia)
        'If Hechizos(uh).Resis = 1 Then Call SubirSkill(UserList(UserIndex).Flags.TargetUser, Resis)

        'pluto:7.0 menos mana elfos
        
            
        
            UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN - Hechizos(uh).ManaRequerido
            
            If uh = 10 And UserList(Userindex).raza = "Humano" Then
                UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN + 150
            End If
            
            If uh = 9 And UserList(Userindex).raza = "NoMuerto" Then
                UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN + 225
            End If
   
                If UserList(Userindex).raza = "Elfo" Then
            Dim bup As Byte
            bup = RandomNumber(1, 10)
            'Debug.Print bup
                If bup = 8 Then
            
            'Debug.Print UserList(Userindex).Stats.MinMAN & "Antes"
            UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN + Porcentaje(UserList(Userindex).Stats.MaxMAN, 15)
            'Debug.Print UserList(Userindex).Stats.MinMAN & "Despues"
            If UserList(Userindex).Stats.MinMAN > UserList(Userindex).Stats.MaxMAN Then UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MaxMAN

            End If
            End If

        'pluto:6.9
        If UserList(Userindex).flags.Privilegios > 0 Then UserList(Userindex).Stats.MinMAN = UserList( _
           Userindex).Stats.MaxMAN

        'pluto:6.5----------------
        Dim obj As ObjData

        If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
            If ObjData(UserList(Userindex).Invent.AnilloEqpObjIndex).SubTipo = 8 Then
                Call AddtoVar(UserList(Userindex).Stats.MinMAN, Porcentaje(Hechizos(uh).ManaRequerido, 20), UserList( _
                                                                                                            Userindex).Stats.MaxMAN)

            End If

        End If

        '----------------------------
        If UserList(Userindex).Stats.MinMAN < 0 Then UserList(Userindex).Stats.MinMAN = 0
        ' paladin aca resu
        If uh = 11 And UCase$(UserList(Userindex).clase) = "PALADIN" Then
            UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN + Hechizos(uh).ManaRequerido
        End If

        'Hechizo purificar Clerigo
        If uh = 75 And UCase$(UserList(Userindex).clase) = "CLERIGO" Then
            Dim Dañoabs As Integer
            Dañoabs = Hechizos(uh).MinHP * 2.2

            UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MinHP + Hechizos(uh).MinHP * 2.2
            Call SendData(ToIndex, Userindex, 0, "|| Has Abosorbido " & Dañoabs & " puntos de vida." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

            If UserList(Userindex).Stats.MinHP >= UserList(Userindex).Stats.MaxHP Then
                UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP

            End If

            Call SendUserStatsVida(Userindex)

        End If

        Call SendUserStatsMana(Userindex)
        Call senduserstatsbox(UserList(Userindex).flags.TargetUser)
        UserList(Userindex).flags.TargetUser = 0

    End If

    Exit Sub
fallo:
    Call LogError("handlehechizousuario " & Err.number & " D: " & Err.Description)

End Sub

Sub HandleHechizoNPC(ByVal Userindex As Integer, ByVal uh As Integer)
'pluto:6.5--------------
'quitar esto
'GoTo je
'If Npclist(UserList(UserIndex).flags.TargetNpc).Raid > 0 And UserList(UserIndex).flags.Privilegios = 0 Then
'   If UserList(UserIndex).flags.party = False Then
'Call SendData(ToIndex, UserIndex, 0, "||Debes estar en Party (Grupo) con 4 jugadores más para poder atacar este Monster DraG" & "´" & FontTypeNames.FONTTYPE_party)
'Exit Sub
'   Else
'      If partylist(UserList(UserIndex).flags.partyNum).numMiembros < 4 Then
'Call SendData(ToIndex, UserIndex, 0, "||Debes estar en Party (Grupo) con 4 jugadores más para poder atacar este Monster DraG" & "´" & FontTypeNames.FONTTYPE_party)
'Exit Sub
'       End If
'   End If
'          If UserList(UserIndex).Stats.ELV > Npclist(UserList(UserIndex).flags.TargetNpc).Raid Then
'          Call SendData(ToIndex, UserIndex, 0, "||Los Dioses no te dejan atacar este MonsterDraG, tienes demasiado nivel." & "´" & FontTypeNames.FONTTYPE_party)
'         End If

'End If
'--------------------
'je:
    On Error GoTo fallo

    Dim b As Boolean

    Select Case Hechizos(uh).Tipo

    Case uEstado    ' Afectan estados (por ejem : Envenenamiento)
        Call HechizoEstadoNPC(UserList(Userindex).flags.TargetNpc, uh, b, Userindex)

    Case uPropiedades    ' Afectan HP,MANA,STAMINA,ETC
        Call HechizoPropNPC(uh, UserList(Userindex).flags.TargetNpc, Userindex, b)

    End Select

    If b Then
        Call SubirSkill(Userindex, Magia)
        UserList(Userindex).flags.TargetNpc = 0

        'pluto:7.0 menos mana elfos
        
            UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN - Hechizos(uh).ManaRequerido

            If UserList(Userindex).raza = "Elfo" Then
            Dim bup As Byte
            bup = RandomNumber(1, 10)
            'Debug.Print bup
                If bup = 8 Then
            
            'Debug.Print UserList(Userindex).Stats.MinMAN & "Antes"
            UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MinMAN + Porcentaje(UserList(Userindex).Stats.MaxMAN, 15)
            If UserList(Userindex).Stats.MinMAN > UserList(Userindex).Stats.MaxMAN Then UserList(Userindex).Stats.MinMAN = UserList(Userindex).Stats.MaxMAN
            'Debug.Print UserList(Userindex).Stats.MinMAN & "Despues"

            End If
            End If
        

        'pluto:6.9
        If UserList(Userindex).flags.Privilegios > 0 Then UserList(Userindex).Stats.MinMAN = UserList( _
           Userindex).Stats.MaxMAN

        'pluto:6.5----------------
        Dim obj As ObjData

        If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
            If ObjData(UserList(Userindex).Invent.AnilloEqpObjIndex).SubTipo = 8 Then
                Call AddtoVar(UserList(Userindex).Stats.MinMAN, Porcentaje(Hechizos(uh).ManaRequerido, 20), UserList( _
                                                                                                            Userindex).Stats.MaxMAN)

            End If

        End If

        '----------------------------
        If UserList(Userindex).Stats.MinMAN < 0 Then UserList(Userindex).Stats.MinMAN = 0

        'Hechizo purificar Clerigo
        If uh = 75 And UCase$(UserList(Userindex).clase) = "CLERIGO" Then
            Dim Dañoabs As Integer
            Dañoabs = Hechizos(uh).MinHP * 2.2

            UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MinHP + Hechizos(uh).MinHP * 2.2
            Call SendData(ToIndex, Userindex, 0, "|| Has Abosorbido " & Dañoabs & " puntos de vida." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

            If UserList(Userindex).Stats.MinHP >= UserList(Userindex).Stats.MaxHP Then
                UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP

            End If

            Call SendUserStatsVida(Userindex)

        End If

        Call SendUserStatsMana(Userindex)

    End If


    Exit Sub
fallo:
    Call LogError("handlehechizonpc " & Err.number & " D: " & Err.Description)

End Sub

Sub LanzarHechizo(index As Integer, Userindex As Integer)

    On Error GoTo fallo

    Dim uh As Integer
    Dim exito As Boolean
    uh = UserList(Userindex).Stats.UserHechizos(index)

    'IRON AO: No pueden revivir en castillos
    'If UserList(Userindex).Pos.Map = 166 And UCase$(Hechizos(uh).Nombre) = UCase$("Resucitar") Then
    'Call SendData(ToIndex, Userindex, 0, "||No se puede resucitar en castillos..." & "´" & FontTypeNames.FONTTYPE_INFO)
    'Exit Sub
    'End If

    'IRON AO: No pueden revivir en castillos
    'If UserList(Userindex).Pos.Map = 167 And UCase$(Hechizos(uh).Nombre) = UCase$("Resucitar") Then
    'Call SendData(ToIndex, Userindex, 0, "||No se puede resucitar en castillos..." & "´" & FontTypeNames.FONTTYPE_INFO)
    'Exit Sub
    'End If

    'IRON AO: No pueden revivir en castillos
    'If UserList(Userindex).Pos.Map = 168 And UCase$(Hechizos(uh).Nombre) = UCase$("Resucitar") Then
    'Call SendData(ToIndex, Userindex, 0, "||No se puede resucitar en castillos..." & "´" & FontTypeNames.FONTTYPE_INFO)
    'Exit Sub
    'End If

    'IRON AO: No pueden revivir en castillos
    'If UserList(Userindex).Pos.Map = 169 And UCase$(Hechizos(uh).Nombre) = UCase$("Resucitar") Then
    'Call SendData(ToIndex, Userindex, 0, "||No se puede resucitar en castillos..." & "´" & FontTypeNames.FONTTYPE_INFO)
    'Exit Sub
    'End If

    'IRON AO: No pueden revivir en castillos
    'If UserList(Userindex).Pos.Map = 185 And UCase$(Hechizos(uh).Nombre) = UCase$("Resucitar") Then
    'Call SendData(ToIndex, Userindex, 0, "||No se puede resucitar en castillos..." & "´" & FontTypeNames.FONTTYPE_INFO)
    'Exit Sub
    'End If

    'IRON AO: Condiciones para lanzar Hechizos
    ' If UserList(Userindex).Invent.WeaponEqpObjIndex = 0 Then
    ' Call SendData(ToIndex, Userindex, 0, "||No puedes lanzar este hechizo sin arma" & "´" & _
      FontTypeNames.FONTTYPE_INFO)
    ' Exit Sub

    ' End If

    'IRON AO: Condiciones para lanzar Hechizos
    'If (UserList(Userindex).Invent.WeaponEqpObjIndex <> 1225 And (UserList(Userindex).Invent.WeaponEqpObjIndex <> 1225 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 1036 _
     And UserList(Userindex).Invent.WeaponEqpObjIndex <> 885 And UserList(Userindex).Invent.WeaponEqpObjIndex _
     <> 1283 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 1187) And UserList(Userindex).Invent.WeaponEqpObjIndex <> 1374 And UCase$(Hechizos(uh).Nombre) = _
     UCase$("Incinerar") Then
    ' Call SendData(ToIndex, Userindex, 0, "||Necesitas tener un Baculo mas poderoso para atacar." & "´" & _
      FontTypeNames.FONTTYPE_INFO)
    ' Exit Sub

    '  End If

    'IRON AO: Condiciones para lanzar Hechizos
    ' If (UserList(Userindex).Invent.WeaponEqpObjIndex <> 1037 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 842 _
      And UserList(Userindex).Invent.WeaponEqpObjIndex <> 753 And UserList(Userindex).Invent.WeaponEqpObjIndex _
      <> 885 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 1283 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 1373 And UserList( _
      Userindex).Invent.WeaponEqpObjIndex <> 1187) And UCase$(Hechizos(uh).Nombre) = UCase$("Llama de Dragon") _
      Then
    ' Call SendData(ToIndex, Userindex, 0, "||Necesitas tener un Baculo mas poderoso para atacar." & "´" & _
      FontTypeNames.FONTTYPE_INFO)
    ' Exit Sub

    '  End If

    'IRON AO: Condiciones para lanzar Hechizos
    ' If (UserList(Userindex).Invent.WeaponEqpObjIndex <> 1037 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 842 _
      And UserList(Userindex).Invent.WeaponEqpObjIndex <> 753 And UserList(Userindex).Invent.WeaponEqpObjIndex _
      <> 1036 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 885 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 1373 And UserList( _
      Userindex).Invent.WeaponEqpObjIndex <> 1283 And UserList(Userindex).Invent.WeaponEqpObjIndex <> 1187) And _
      UCase$(Hechizos(uh).Nombre) = UCase$("LLuvia de Sangre") Then
    '   Call SendData(ToIndex, Userindex, 0, "||Necesitas tener un Baculo mas poderoso para atacar." & "´" & _
        FontTypeNames.FONTTYPE_INFO)
    '  Exit Sub

    'End If

    If PuedeLanzar(Userindex, uh) Then

        Select Case Hechizos(uh).Target

        Case uUsuarios

            If UserList(Userindex).flags.TargetUser > 0 Then

                Call HandleHechizoUsuario(Userindex, uh)
                Call SendData(ToIndex, Userindex, 0, "CART")
                ''' timer para la invi igual modificar
                If uh = 14 Then
                    'Call SendData(ToIndex, Userindex, 0, "INVI")
                End If
            Else
                Call SendData(ToIndex, Userindex, 0, "||Este hechizo actua solo sobre usuarios." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)

            End If

        Case uNPC

            If UserList(Userindex).flags.TargetNpc > 0 Then
                Call HandleHechizoNPC(Userindex, uh)
                Call SendData(ToIndex, Userindex, 0, "CART")
            Else
                Call SendData(ToIndex, Userindex, 0, "||Este hechizo solo afecta a los npcs." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)

            End If

        Case uUsuariosYnpc

            If UserList(Userindex).flags.TargetUser > 0 Then
                Call HandleHechizoUsuario(Userindex, uh)
                Call SendData(ToIndex, Userindex, 0, "CART")
            ElseIf UserList(Userindex).flags.TargetNpc > 0 Then
                Call HandleHechizoNPC(Userindex, uh)
                Call SendData(ToIndex, Userindex, 0, "CART")
            Else
                Call SendData(ToIndex, Userindex, 0, "||Target invalido." & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

        Case uTerreno
            Call HandleHechizoTerreno(Userindex, uh)
            Call SendData(ToIndex, Userindex, 0, "CART")

        End Select

    End If

    Exit Sub
fallo:
    Call LogError("lanzarhechizo " & Err.number & " D: " & Err.Description)

End Sub

Sub HechizoEstadoUsuario(ByVal Userindex As Integer, ByRef b As Boolean)

    On Error GoTo fallo

    Dim H As Integer, TU As Integer, abody As Integer, al As Integer
    H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)
    TU = UserList(Userindex).flags.TargetUser

    'pluto:2.17
    'If Hechizos(H).Invisibilidad = 1 And UserList(UserIndex).Pos.Map = 252 Then Exit Sub

    'pluto:6.0A
    'If Hechizos(H).Noesquivar = 1 Then GoTo noes
    'Dim oo As Byte
    'oo = RandomNumber(1, 100)
    'Call SubirSkill(TU, EvitaMagia)
    'If oo < CInt((UserList(TU).Stats.UserSkills(EvitaMagia) / 10) + 2) And UserIndex <> TU Then
    'Call SendData(ToIndex, UserIndex, 0, "|| Se ha Resistido a la Magia !!" & FONTTYPENAMES.FONTTYPE_fight)
    'Call SendData(ToIndex, TU, 0, "|| Has Resistido una Magia !!" & FONTTYPENAMES.FONTTYPE_fight)
    'b = True
    'Exit Sub
    'End If
    '--------------------
noes:

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

    '[MerLiNz:X]
    If Hechizos(H).Morph = 1 And UserList(TU).flags.Morph = 0 And UserList(TU).flags.Angel = 0 And UserList( _
       TU).flags.Demonio = 0 Then

        If UserList(TU).flags.Navegando = 1 Or UserList(TU).flags.Muerto > 0 Then Exit Sub

        'pluto:2.14
        If UserList(TU).flags.ClaseMontura > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes usar este hechizo contra una mascota." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'pluto:6.9
        If MapInfo(UserList(TU).Pos.Map).Pk = False And TU <> Userindex Then
            Call SendData(ToIndex, Userindex, 0, _
                          "||No puedes usar este hechizo sobre otros personajes en zona segura." & "´" & _
                          FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        '[\END]
        If UCase$(UserList(Userindex).clase) <> "DRUIDA" And UCase$(UserList(Userindex).clase) <> "MAGO" Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes usar este hechizo." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If UCase$(UserList(Userindex).clase) = "MAGO" And UserList(Userindex).Stats.ELV < 30 Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes usar este hechizo hasta level 30." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        UserList(TU).flags.Morph = UserList(TU).Char.Body
        UserList(TU).Counters.Morph = IntervaloMorphPJ
        Call InfoHechizo(Userindex)
        '[gau]
        Call ChangeUserChar(ToMap, 0, UserList(TU).Pos.Map, TU, val(abody), val(0), UserList(TU).Char.Heading, _
                            UserList(TU).Char.WeaponAnim, UserList(TU).Char.ShieldAnim, UserList(TU).Char.CascoAnim, UserList( _
                                                                                                                     Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
        Call SendData2(ToPCArea, Userindex, UserList(TU).Pos.Map, 22, UserList(TU).Char.CharIndex & "," & Hechizos( _
                                                                      H).FXgrh & "," & Hechizos(H).loops)
        b = True

    End If

    'pluto:2.7.0 impide invis en demonios, angeles..
    If Hechizos(H).Invisibilidad = 1 And UserList(TU).flags.Morph = 0 And UserList(TU).flags.Angel = 0 And UserList( _
       TU).flags.Demonio = 0 Then

        'pluto:6.0A-----
        If MapInfo(UserList(TU).Pos.Map).Pk = False Then GoTo nopi
        If UserList(Userindex).Pos.Map > 199 And UserList(Userindex).Pos.Map < 212 Then Exit Sub
        If UserList(Userindex).Pos.Map = 268 Or UserList(Userindex).Pos.Map = 269 Then Exit Sub
        'If UserList(Userindex).Pos.Map = 182 Or UserList(Userindex).Pos.Map = 92 Or UserList(Userindex).Pos.Map = 279 Then Exit Sub
        '---------------
        UserList(TU).flags.Invisible = 1
        Call SendData(ToIndex, TU, 0, "INVI")
        Call SendData2(ToMap, 0, UserList(TU).Pos.Map, 16, UserList(TU).Char.CharIndex & ",1")
        Call InfoHechizo(Userindex)

        'gollum
        Dim ry88 As Integer
        ry88 = RandomNumber(1, 1000)

        'pluto:2-3-04
        If ry88 = 251 Then Tesoromomia = 0
        If ry88 = 243 Then Tesorocaballero = 0

        'pluto:6.0 añade sala invo 165
        If ry88 = 92 And MapInfo(UserList(TU).Pos.Map).Pk = True And Not (UserList(TU).Pos.Map > 164 And UserList( _
                                                                          TU).Pos.Map < 170) Then
            Call SpawnNpc(594, UserList(TU).Pos, True, False)
            Call SendData(ToAll, 0, 0, "TW" & 106)
            Call SendData(ToAll, 0, 0, "||¡¡¡ Gollum, la más terrible de las criaturas apareció junto a " & UserList( _
                                       Userindex).Name & " en el Mapa " & UserList(Userindex).Pos.Map & " !!!" & "´" & _
                                       FontTypeNames.FONTTYPE_GUILD)

        End If

        'fin gollum
        b = True

    End If

nopi:

    If Hechizos(H).Envenena > 0 Then
        If Not PuedeAtacar(Userindex, TU) Then Exit Sub
        If Userindex <> TU Then
            Call UsuarioAtacadoPorUsuario(Userindex, TU)

        End If

        If UCase$(UserList(TU).clase) <> "BARDO" And UserList(TU).flags.Angel = 0 And UserList(TU).flags.Demonio = 0 _
           Then
            UserList(TU).flags.Envenenado = Hechizos(H).Envenena + CInt(UserList(Userindex).Stats.ELV / 5)
            Call InfoHechizo(Userindex)
            b = True
        Else
            Call SendData(ToIndex, TU, 0, "|| " & UserList(Userindex).Name & _
                                          " te ha intentado envenenar, pero eres INMUNE!!" & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, Userindex, 0, "|| " & UserList(TU).Name & " es INMUNE!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

    End If

    'pluto:2.15
    If Hechizos(H).Protec > 0 Then

        If Userindex = TU Then
            UserList(TU).flags.Protec = Hechizos(H).Protec
            Call InfoHechizo(Userindex)
            UserList(TU).Counters.Protec = 100 * Hechizos(H).Protec
            Call SendData(ToIndex, Userindex, 0, "S1")

            b = True
        Else
            Call SendData(ToIndex, Userindex, 0, "|| No puedes lanzar este hechizo sobre otros usuarios." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

    End If

    '--------------

    If Hechizos(H).CuraVeneno = 1 Then
        UserList(TU).flags.Envenenado = 0
        Call InfoHechizo(Userindex)
        b = True

    End If

    If Hechizos(H).Maldicion = 1 Then
        If Not PuedeAtacar(Userindex, TU) Then Exit Sub
        If Userindex <> TU Then
            Call UsuarioAtacadoPorUsuario(Userindex, TU)

        End If

        UserList(TU).flags.Maldicion = 1
        Call InfoHechizo(Userindex)
        b = True

    End If

    If Hechizos(H).RemoverMaldicion = 1 Then
        UserList(TU).flags.Maldicion = 0
        Call InfoHechizo(Userindex)
        b = True

    End If

    If Hechizos(H).Bendicion = 1 Then
        UserList(TU).flags.Bendicion = 1
        Call InfoHechizo(Userindex)
        b = True

    End If

    If Hechizos(H).Paraliza = 1 Then
        Call SendData2(ToIndex, TU, 0, 117)
        If UserList(TU).flags.Paralizado = 0 And UserList(TU).flags.Muerto = 0 Then
            If Not PuedeAtacar(Userindex, TU) Then Exit Sub

            If Userindex <> TU Then
                Call UsuarioAtacadoPorUsuario(Userindex, TU)

            End If

            UserList(TU).flags.Paralizado = 1

            'pluto:7.0
            'If UserList(TU).raza = "Enano" Then
             '   UserList(TU).Counters.Paralisis = CInt(IntervaloParalisisPJ - 50)
            'Else
                UserList(TU).Counters.Paralisis = IntervaloParalisisPJ

           ' End If

            Dim rt As Integer
            rt = RandomNumber(1, 100)

            'If UCase$(UserList(TU).clase) = "DRUIDA" And rt > 80 Then UserList(TU).Counters.Paralisis = 0
            'pluto:7.0
            If UserList(TU).raza = "Goblin" And rt < 15 Then UserList(TU).Counters.Paralisis = 0

            'pluto:2.4.1
            Dim obj As ObjData

            If UserList(TU).Invent.AnilloEqpObjIndex > 0 Then
                If ObjData(UserList(TU).Invent.AnilloEqpObjIndex).SubTipo = 3 And rt > 80 Then
                    UserList(TU).Counters.Paralisis = 0
                    Call SendData(ToIndex, TU, 0, "||Anillo impide parálisis" & "´" & FontTypeNames.FONTTYPE_VENENO)

                End If

            End If

            Call SendData2(ToIndex, TU, 0, 68)
            Call SendData2(ToIndex, TU, 0, 15, UserList(TU).Pos.X & "," & UserList(TU).Pos.Y)
            Call InfoHechizo(Userindex)
            b = True

        End If

    End If

    If Hechizos(H).RemoverParalisis = 1 Then
        If UserList(TU).flags.Paralizado = 1 Then
            UserList(TU).flags.Paralizado = 0
            Call SendData2(ToIndex, TU, 0, 68)
            Call InfoHechizo(Userindex)
            b = True

        End If

    End If

    If Hechizos(H).Revivir = 1 Then




        'pluto:6.0A
        If MapInfo(UserList(TU).Pos.Map).Resucitar = 1 Then Exit Sub

        If UserList(TU).Faccion.ArmadaReal = 1 And UserList(Userindex).Faccion.FuerzasCaos = 1 Then
                    Call SendData(ToIndex, Userindex, 0, "||¡No puedes revivir un usuario de tu facción contratria.." & "´" _
                                                 & FontTypeNames.FONTTYPE_INFO)
        Exit Sub
        End If
        
        If UserList(TU).Faccion.FuerzasCaos = 1 And UserList(Userindex).Faccion.ArmadaReal = 1 Then
                    Call SendData(ToIndex, Userindex, 0, "||¡No puedes revivir un usuario de tu facción contratria.." & "´" _
                                                 & FontTypeNames.FONTTYPE_INFO)
        Exit Sub
        End If
        
        'WOAO: Tiempo Revivir.
        'If UserList(TU).flags.TiempoRev > 0 Then
         '   Call SendData(ToIndex, TU, 0, "||Tienes que esperar " & UserList(TU).flags.TiempoRev & " Segundos para ser revivido." & "´" & _
                                          FontTypeNames.FONTTYPE_GUILD)
          '  Call SendData(ToIndex, Userindex, 0, "||Tienes que esperar " & UserList(TU).flags.TiempoRev & " Segundos para ser revivir al usuario." & "´" _
                                                 & FontTypeNames.FONTTYPE_INFO)
           ' Exit Sub
        'End If

        'WOAO: Seguro Revivir.
        If UserList(TU).flags.SeguroRev = True Then
            Call SendData(ToIndex, TU, 0, "||Debes desactivar el seguro de Revivir para poder ser Resucitado." & "´" & _
                                          FontTypeNames.FONTTYPE_GUILD)
            Call SendData(ToIndex, Userindex, 0, "||¡El usuario tiene el seguro de resucitar Activado." & "´" _
                                                 & FontTypeNames.FONTTYPE_INFO)
            Exit Sub
        End If

        If UserList(TU).flags.Muerto = 1 And UserList(TU).Char.Body <> 87 Then
            If Not Criminal(TU) Then
                If TU <> Userindex Then
                    'Call AddtoVar(UserList(Userindex).Reputacion.NobleRep, 500, MAXREP)
                    'Call SendData(ToIndex, Userindex, 0, _
                                  "||¡Los Dioses te sonrien, has ganado 500 puntos de nobleza!." & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)

                End If

            End If

            If UCase$(Hechizos(H).Nombre) = "PODER DIVINO" Then Call RevivirUsuarioangel(TU) Else Call RevivirUsuario( _
               TU)
            Call InfoHechizo(Userindex)
            b = True
        Else
            Call SendData(ToIndex, Userindex, 0, "||¡No puedes resucitar, no está muerto o está en modo barco." & "´" _
                                                 & FontTypeNames.FONTTYPE_INFO)

        End If

    End If



    If Hechizos(H).Ceguera = 1 Then
        If Not PuedeAtacar(Userindex, TU) Then Exit Sub
        If Userindex <> TU Then
            Call UsuarioAtacadoPorUsuario(Userindex, TU)

        End If

        If UCase$(UserList(TU).clase) <> "BARDO" And UserList(TU).flags.Angel = 0 And UserList(TU).flags.Demonio = 0 _
           And UserList(TU).flags.Montura = 0 Then
            UserList(TU).flags.Ceguera = 1
            UserList(TU).Counters.Ceguera = Intervaloceguera
            Call SendData2(ToIndex, TU, 0, 2)
            Call InfoHechizo(Userindex)
            b = True
        Else
            Call SendData(ToIndex, TU, 0, "|| " & UserList(Userindex).Name & _
                                          " te ha intentado cegar, pero eres INMUNE!!" & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, Userindex, 0, "|| " & UserList(TU).Name & " es INMUNE!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

    End If

    If Hechizos(H).Estupidez = 1 Then
        If Not PuedeAtacar(Userindex, TU) Then Exit Sub
        If Userindex <> TU Then
            Call UsuarioAtacadoPorUsuario(Userindex, TU)

        End If

        'pluto:2.11 añade montura
        If UCase$(UserList(TU).clase) <> "BARDO" And UserList(TU).flags.Angel = 0 And UserList(TU).flags.Demonio = 0 _
           And UserList(TU).flags.Montura = 0 Then
            UserList(TU).flags.Estupidez = 1
            UserList(TU).Counters.Estupidez = Intervaloceguera
            Call SendData2(ToIndex, TU, 0, 3)
            Call InfoHechizo(Userindex)
            b = True
        Else
            Call SendData(ToIndex, TU, 0, "|| " & UserList(Userindex).Name & _
                                          " te ha intentado volver estúpido, pero eres INMUNE!!" & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, Userindex, 0, "|| " & UserList(TU).Name & " es INMUNE!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

    End If

    Exit Sub
fallo:
    Call LogError("hechizoestadousuario " & Err.number & " D: " & Err.Description)

End Sub

Sub HechizoEstadoNPC(ByVal NpcIndex As Integer, _
                     ByVal hindex As Integer, _
                     ByRef b As Boolean, _
                     ByVal Userindex As Integer)

    On Error GoTo fallo

    If Hechizos(hindex).Invisibilidad = 1 Then

        Call InfoHechizo(Userindex)
        Npclist(NpcIndex).flags.Invisible = 1
        b = True

    End If

    If Hechizos(hindex).Envenena = 1 Then
        If Npclist(NpcIndex).Attackable = 0 Then
            Call SendData(ToIndex, Userindex, 0, "L5")
            Exit Sub

        End If

        Call InfoHechizo(Userindex)
        Npclist(NpcIndex).flags.Envenenado = 1
        b = True

    End If

    If Hechizos(hindex).CuraVeneno = 1 Then
        Call InfoHechizo(Userindex)
        Npclist(NpcIndex).flags.Envenenado = 0
        b = True

    End If

    If Hechizos(hindex).Maldicion = 1 Then
        If Npclist(NpcIndex).Attackable = 0 Then
            Call SendData(ToIndex, Userindex, 0, "L5")
            Exit Sub

        End If

        Call InfoHechizo(Userindex)
        Npclist(NpcIndex).flags.Maldicion = 1
        b = True

    End If

    If Hechizos(hindex).RemoverMaldicion = 1 Then
        Call InfoHechizo(Userindex)
        Npclist(NpcIndex).flags.Maldicion = 0
        b = True

    End If

    If Hechizos(hindex).Bendicion = 1 Then
        Call InfoHechizo(Userindex)
        Npclist(NpcIndex).flags.Bendicion = 1
        b = True

    End If

    'paralisis en area
    If Hechizos(hindex).Paralizaarea = 1 Then
        If Npclist(NpcIndex).flags.AfectaParalisis = 0 Then
            Call InfoHechizo(Userindex)
            Npclist(NpcIndex).flags.Paralizado = 1
            Npclist(NpcIndex).Contadores.Paralisis = IntervaloParalizado
            b = True
        Else
            Call SendData(ToIndex, Userindex, 0, "||El npc es inmune a este hechizo." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If

        Dim X As Integer
        Dim Y As Integer
        Dim H As Integer
        'Dim P As Integer
        H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)

        'P = MapData(UserList(UserIndex).Pos.Map, X, Y).NpcIndex
        For Y = UserList(Userindex).Pos.Y - MinYBorder + 1 To UserList(Userindex).Pos.Y + MinYBorder - 1
            For X = UserList(Userindex).Pos.X - MinXBorder + 1 To UserList(Userindex).Pos.X + MinXBorder - 1

                If X > 0 And Y > 0 And X < 101 And Y < 101 Then
                    If MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex > 0 Then

                        If Npclist(MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex).flags.AfectaParalisis = 0 Then
                            'Call InfoHechizo(UserIndex)
                            Npclist(MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex).flags.Paralizado = 1
                            Npclist(MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex).Contadores.Paralisis = _
                            IntervaloParalizado
                            Call SendData2(ToPCArea, Userindex, Npclist(MapData(UserList(Userindex).Pos.Map, X, _
                                                                                Y).NpcIndex).Pos.Map, 22, Npclist(MapData(UserList(Userindex).Pos.Map, X, _
                                                                                                                          Y).NpcIndex).Char.CharIndex & "," & Hechizos(H).FXgrh & "," & Hechizos(H).loops)

                            b = True
                        Else
                            Call SendData(ToIndex, Userindex, 0, "||El npc es inmune a este hechizo." & "´" & _
                                                                 FontTypeNames.FONTTYPE_FIGHT)

                        End If

                    End If

                End If

            Next X
        Next Y

    End If

    If Hechizos(hindex).Paraliza = 1 Then
        If Npclist(NpcIndex).flags.AfectaParalisis = 0 Then
            Call InfoHechizo(Userindex)
            Npclist(NpcIndex).flags.Paralizado = 1
            Npclist(NpcIndex).Contadores.Paralisis = IntervaloParalizado
            b = True
        Else
            Call SendData(ToIndex, Userindex, 0, "||El npc es inmune a este hechizo." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If

    End If

    If Hechizos(hindex).RemoverParalisis = 1 Then
        If Npclist(NpcIndex).flags.Paralizado = 1 Then
            Call InfoHechizo(Userindex)
            Npclist(NpcIndex).flags.Paralizado = 0
            Npclist(NpcIndex).Contadores.Paralisis = 0
            b = True

        Else
            Call SendData(ToIndex, Userindex, 0, "||El npc no esta paralizado." & "´" & FontTypeNames.FONTTYPE_INFO)

        End If

    End If

    Exit Sub
fallo:
    Call LogError("hechizoestadonpc " & Err.number & " D: " & Err.Description)

End Sub

Sub HechizoPropNPC(ByVal hindex As Integer, _
                   ByVal NpcIndex As Integer, _
                   ByVal Userindex As Integer, _
                   ByRef b As Boolean)

    On Error GoTo errhandler

    Dim daño As Integer
    Dim Loco As Integer
    Dim nPos As WorldPos
    Dim Critico As Integer
    Dim Criti As Byte
    Dim Topito As Long
    Dim LogroOro As Boolean
    
    
    If UserList(Userindex).Faccion.SoyCaos = 1 And Npclist(NpcIndex).NPCtype = 11 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes atacar o curar este NPC!!" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub
    
    End If
    
    If UserList(Userindex).Faccion.SoyReal = 1 And Npclist(NpcIndex).NPCtype = 2 Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes atacar o curar este NPC!!" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub
    
    End If

    'pluto:2.17
    If Npclist(NpcIndex).NPCtype = 78 Then

        nPos.Map = Npclist(NpcIndex).Pos.Map
        nPos.X = Npclist(NpcIndex).Pos.X
        nPos.Y = Npclist(NpcIndex).Pos.Y

        'pluto:6.0A-----------------
        If Hechizos(hindex).SubeHP = 1 And nPos.Y > UserList(Userindex).Pos.Y Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes restaurar la puerta desde este lado." & "´" & _
                                                 FontTypeNames.FONTTYPE_GUILD)
            Exit Sub

        End If


        '----------------------------
        Select Case Npclist(NpcIndex).Stats.MinHP

        Case 10000 To 15000
            Npclist(NpcIndex).Char.Body = 360

        Case 5000 To 9999
            Npclist(NpcIndex).Char.Body = 361

        Case 1 To 4999
            Npclist(NpcIndex).Char.Body = 362

        End Select

        Call ChangeNPCChar(ToMap, 0, nPos.Map, NpcIndex, Npclist(NpcIndex).Char.Body, 0, 1, 1)

    End If

    '--------------------------------------------

    If Hechizos(hindex).SubeHP > 1 Then
        'pluto:2.15
        'If Npclist(NpcIndex).NPCtype = 79 Then

        'If (MapInfo(Npclist(NpcIndex).Pos.Map).Dueño = 1 And UserList(UserIndex).Faccion.FuerzasCaos = 0) Or (MapInfo(Npclist(NpcIndex).Pos.Map).Dueño = 2 And UserList(UserIndex).Faccion.ArmadaReal = 0) Then
        'Call SendData(ToIndex, UserIndex, 0, "||Tu armada te prohibe atacar este NPC." & FONTTYPENAMES.FONTTYPE_GUILD)
        'Exit Sub
        'End If

        'pluto:2.17
        'If Conquistas = False Then
        'Call SendData(ToIndex, UserIndex, 0, "||No se puede conquistar ciudades en estos momentos." & FONTTYPENAMES.FONTTYPE_INFO)
        'Exit Sub
        'End If

        'End If '79
        '--------------

        'pluto:2.17
        If Npclist(NpcIndex).NPCtype = 33 Or Npclist(NpcIndex).NPCtype = 61 Or Npclist(NpcIndex).NPCtype = 77 Or _
           Npclist(NpcIndex).NPCtype = 78 Then

            If MapInfo(Npclist(NpcIndex).Pos.Map).Zona = "CASTILLO" Then
                Dim castiact As String

                If Npclist(NpcIndex).Pos.Map = mapa_castillo1 Then castiact = castillo1
                If Npclist(NpcIndex).Pos.Map = mapa_castillo2 Then castiact = castillo2
                If Npclist(NpcIndex).Pos.Map = mapa_castillo3 Then castiact = castillo3
                If Npclist(NpcIndex).Pos.Map = mapa_castillo4 Then castiact = castillo4

                'pluto:2.18
                If Npclist(NpcIndex).Pos.Map = 268 Then castiact = castillo1
                If Npclist(NpcIndex).Pos.Map = 269 Then castiact = castillo2
                If Npclist(NpcIndex).Pos.Map = 270 Then castiact = castillo3
                If Npclist(NpcIndex).Pos.Map = 271 Then castiact = castillo4

                '------------------------------
                If Npclist(NpcIndex).Pos.Map = 185 Then castiact = fortaleza

                If UserList(Userindex).GuildInfo.GuildName = "" Then
                    Call SendData(ToIndex, Userindex, 0, "||No tienes clan!!" & "´" & FontTypeNames.FONTTYPE_FIGHT)
                    Exit Sub

                End If

                If UserList(Userindex).GuildInfo.GuildName = castiact Then
                    Call SendData(ToIndex, Userindex, 0, "||No puedes atacar tu castillo ¬¬" & "´" & _
                                                         FontTypeNames.FONTTYPE_FIGHT)
                    Exit Sub

                End If

                'pluto:2.4.1

                If UserList(Userindex).Pos.Map = 185 And (UserList(Userindex).GuildInfo.GuildName <> castillo1 Or _
                                                          UserList(Userindex).GuildInfo.GuildName <> castillo2 Or UserList( _
                                                          Userindex).GuildInfo.GuildName <> castillo3 Or UserList(Userindex).GuildInfo.GuildName <> _
                                                          castillo4) Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||No puedes atacar Fortaleza sin tener Conquistado los 4 Castillos." & "´" & _
                                  FontTypeNames.FONTTYPE_FIGHT)
                    Exit Sub

                End If

                'pluto.6.0A
                If UserList(Userindex).GuildInfo.GuildName <> "" Then
                    If UserList(Userindex).GuildRef.Nivel < 2 And Npclist(NpcIndex).NPCtype = 61 And UserList( _
                       Userindex).Pos.Map = 185 Then
                        Call SendData(ToIndex, Userindex, 0, "||Tu Clan no tiene suficiente Nivel." & "´" & _
                                                             FontTypeNames.FONTTYPE_FIGHT)
                        Exit Sub

                    End If

                End If

                '-----------------
                Set UserList(Userindex).GuildRef = FetchGuild(UserList(Userindex).GuildInfo.GuildName)

                If Not UserList(Userindex).GuildRef Is Nothing Then
                    If UserList(Userindex).GuildRef.IsAllie(castiact) Then
                        Call SendData(ToIndex, Userindex, 0, "||No puedes atacar castillos de clanes aliados :P" & _
                                                             "´" & FontTypeNames.FONTTYPE_FIGHT)
                        Exit Sub

                    End If

                End If

            End If

        End If

    End If

    'Salud
    If Hechizos(hindex).SubeHP = 1 Then
        daño = RandomNumber(Hechizos(hindex).MinHP, Hechizos(hindex).MaxHP)

        'daño = daño + Porcentaje(daño, 3 * UserList(UserIndex).Stats.ELV)
        'pluto:6.0----------------------------------------
        If UserList(Userindex).Remort = 0 Then
            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
        Else

            If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
                'Dim Topito As Long
                Topito = UserList(Userindex).Stats.ELV * 3.65

                If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
                daño = daño + Porcentaje(daño, Topito)
            Else
                daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

            End If

        End If

        '-------------------------------------------------

        'pluto:2.17
        Dim lleno As Byte

        'If Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MaxHP Then lleno = 1 Else lleno = 0
        If Npclist(NpcIndex).Stats.MaxHP < Npclist(NpcIndex).Stats.MinHP + daño Then lleno = 1 Else lleno = 0
        Call InfoHechizo(Userindex)
        Call AddtoVar(Npclist(NpcIndex).Stats.MinHP, daño, Npclist(NpcIndex).Stats.MaxHP)
        Call SendData(ToIndex, Userindex, 0, "||Has curado " & daño & " puntos de salud a la criatura." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
        b = True

        'pluto:2.15
        If (Npclist(NpcIndex).NPCtype = 78 Or Npclist(NpcIndex).NPCtype = 77 Or Npclist(NpcIndex).NPCtype = 33 Or _
            Npclist(NpcIndex).NPCtype = 61) And lleno = 1 Then

            If Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MaxHP Then

                Select Case Npclist(NpcIndex).Pos.Map

                Case 268
                    Call SendData(ToAll, 0, 0, "C5")
                    AtaNorte = 0

                Case 269
                    Call SendData(ToAll, 0, 0, "C6")
                    AtaSur = 0

                Case 270
                    Call SendData(ToAll, 0, 0, "C7")
                    AtaEste = 0

                Case 271
                    Call SendData(ToAll, 0, 0, "C8")
                    AtaOeste = 0

                Case 166
                    Call SendData(ToAll, 0, 0, "C5")
                    AtaNorte = 0

                Case 167
                    Call SendData(ToAll, 0, 0, "C6")
                    AtaSur = 0

                Case 168
                    Call SendData(ToAll, 0, 0, "C7")
                    AtaEste = 0

                Case 169
                    Call SendData(ToAll, 0, 0, "C8")
                    AtaOeste = 0

                Case 185
                    Call SendData(ToAll, 0, 0, "V9")
                    AtaForta = 0

                End Select

            End If

        End If

    ElseIf Hechizos(hindex).SubeHP = 2 Then

        If Npclist(NpcIndex).Attackable = 0 Then
            Call SendData(ToIndex, Userindex, 0, "L5")
            Exit Sub

        End If
        
        
    Dim NombreU As Integer
    NombreU = Npclist(NpcIndex).flags.Oponente
    Dim NPCAnterior As Integer
    NPCAnterior = UserList(Userindex).flags.AfectaNPC
    'Debug.Print NombreU & "Lele"
    'Debug.Print Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And UserList(Userindex).flags.Seguro = True And Not Npclist(NpcIndex).flags.Oponente = Userindex And NombreU > 0
    
    'If UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos Then
    'Call SendData(ToIndex, Userindex, 0, "||asdasdasdasd " & UserList(Npclist(NpcIndex).flags.Oponente).Name & FONTTYPE_FIGHT)
    'Exit Sub
        'Debug.Print "LELE"
    'End If
    If Not NombreU = 0 Then
        If MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "EVENTO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "CASTILLO" And UserList(Userindex).Pos.Map <> 182 And UserList(Userindex).Pos.Map <> 92 And UserList(Userindex).Pos.Map <> 279 And UserList(Userindex).Pos.Map <> 165 Then
        If UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And Not UserList(NombreU).flags.partyNum = UserList(Userindex).flags.partyNum Or UserList(NombreU).flags.partyNum = 0 Then
            If Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And UserList(Userindex).flags.Seguro = True And Not Npclist(NpcIndex).flags.Oponente = Userindex Then
        'If Not Npclist(NpcIndex).flags.Oponente = Userindex Then
            Call SendData(ToIndex, Userindex, 0, "||No podes atacar este npc, esta afectado por " & UserList(Npclist(NpcIndex).flags.Oponente).Name & ", deberas desactivar el SEGURO para poder hacerlo, pero pagarás con un gran castigo." & "´" & FONTTYPE_INFO)
            Exit Sub
        ElseIf Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And UserList(Userindex).flags.Seguro = False Then
            UserList(Userindex).Faccion.Castigo = 10
            UserList(Userindex).Faccion.FuerzasCaos = 0
            UserList(Userindex).Faccion.ArmadaReal = 2
            End If
        End If
        End If
    End If
    
    
    If Not NombreU = 0 Then
    If MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "EVENTO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "CASTILLO" And UserList(Userindex).Pos.Map <> 182 And UserList(Userindex).Pos.Map <> 92 And UserList(Userindex).Pos.Map <> 279 And UserList(Userindex).Pos.Map <> 165 Then
        If UserList(NombreU).Faccion.ArmadaReal = UserList(Userindex).Faccion.ArmadaReal And Not UserList(NombreU).flags.partyNum = UserList(Userindex).flags.partyNum And UserList(Userindex).flags.partyNum = 0 Then
            If Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.ArmadaReal = UserList(Userindex).Faccion.ArmadaReal And UserList(Userindex).flags.Seguro = True And Not Npclist(NpcIndex).flags.Oponente = Userindex Then
        'If Not Npclist(NpcIndex).flags.Oponente = Userindex Then
            Call SendData(ToIndex, Userindex, 0, "||No podes atacar este npc, esta afectado por " & UserList(Npclist(NpcIndex).flags.Oponente).Name & ", deberas desactivar el SEGURO para poder hacerlo, pero pagarás con un gran castigo." & "´" & FONTTYPE_INFO)
            Exit Sub
        ElseIf Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And UserList(Userindex).flags.Seguro = False Then
            UserList(Userindex).Faccion.Castigo = 10
            UserList(Userindex).Faccion.ArmadaReal = 2
            End If
        End If
        End If
    End If
    
    'Debug.Print UserList(Userindex).flags.AfectaNPC
    'Debug.Print Npclist(NpcIndex).flags.Oponente
    If NPCAnterior > 0 Then
    Npclist(NPCAnterior).flags.Oponente = 0
    End If
    
    'Debug.Print Npclist(NpcIndex).flags.Oponente
    
    UserList(Userindex).flags.AfectaNPC = 0
    Npclist(NpcIndex).flags.Oponente = 0
    UserList(Userindex).flags.AfectaNPC = NpcIndex
    Npclist(NpcIndex).flags.Oponente = Userindex
    


        'pluto:6.6--------
        If Npclist(NpcIndex).MaestroUser = Userindex Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes atacar tus mascotas." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub

        End If

        'pluto:6.7
        If Npclist(NpcIndex).MaestroUser > 0 And MapInfo(Npclist(NpcIndex).Pos.Map).Pk = False Then
            Call SendData(ToIndex, Userindex, 0, "||No puedes atacar mascotas en zona segura." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub

        End If

        '-----------------
        'pluto:2.6.0
        If (EsMascotaCiudadano(NpcIndex, Userindex) Or Npclist(NpcIndex).NPCtype = NPCTYPE_GUARDIAS) Then

            If UserList(Userindex).Faccion.ArmadaReal = 1 Then
            If UserList(Userindex).flags.Seguro = True Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes atacar mascotas de la Alianza. Quita el SEGURO para realizar esta acción, deberás pagar luego de cometer este delito" & "´" & _
                                                     FontTypeNames.FONTTYPE_GUILD)
                Else
                UserList(Userindex).Faccion.Castigo = 10
                UserList(Userindex).Faccion.ArmadaReal = 2
                Exit Sub

            End If
            End If

        End If
        
        
            If UserList(Userindex).Faccion.FuerzasCaos > 0 And Npclist(NpcIndex).MaestroUser > 0 Then
            If UserList(Userindex).flags.Seguro = True Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes atacar mascotas de la Horda. Quita el SEGURO para realizar esta acción, deberás pagar luego de cometer este delito" & "´" & _
                                                     FontTypeNames.FONTTYPE_GUILD)
                Else
                UserList(Userindex).Faccion.Castigo = 10
                UserList(Userindex).Faccion.ArmadaReal = 2
                Exit Sub
            End If
            End If



        'pluto:2.11
        'If Npclist(NpcIndex).Stats.Alineacion = 0 And UserList(UserIndex).Faccion.ArmadaReal > 0 Then
        'Call SendData(ToIndex, UserIndex, 0, "||Tu armada te prohibe atacar este tipo de criaturas." & FONTTYPENAMES.FONTTYPE_GUILD)
        'Exit Sub
        'End If

        'pluto:6.5----------------------
        If UserList(Userindex).flags.Privilegios > 0 Then
            Npclist(NpcIndex).flags.AttackedBy = UserList(Userindex).Name

        End If

        '------------------------------
        daño = RandomNumber(Hechizos(hindex).MinHP, Hechizos(hindex).MaxHP)

        If UCase$(Hechizos(hindex).Nombre) = "RAYO GM" Then
            'pluto:2.14
            Call LogGM(UserList(Userindex).Name, "RAYO GM: " & Npclist(NpcIndex).Name)

            daño = 800
            'quitar esto
            Npclist(NpcIndex).Stats.MinHP = 0

        End If

        'pluto:6.0----------------------------------------
        If UserList(Userindex).Remort = 0 Then
            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
        Else

            If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
                ' Dim Topito As Long
                Topito = UserList(Userindex).Stats.ELV * 3.65

                If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
                daño = daño + Porcentaje(daño, Topito)
            Else
                daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

            End If

        End If

        '-------------------------------------------------

        'pluto:7.0 añado logro plata y oro-------------------------
        'LogroOro = False
        If Npclist(NpcIndex).LogroTipo > 0 Then

            Select Case UserList(Userindex).Stats.PremioNPC(Npclist(NpcIndex).LogroTipo)

            Case 25 To 249
                daño = daño + Porcentaje(daño, 5)

            Case Is > 249
                daño = daño + Porcentaje(daño, 15)

            Case Is > 449
                LogroOro = True

                'If UserList(UserIndex).Stats.PremioNPC(Npclist(NpcIndex).LogroTipo) > 249 Then daño = daño + Porcentaje(daño, 10)
                'If UserList(UserIndex).Stats.PremioNPC(Npclist(NpcIndex).LogroTipo) > 449 Then LogroOro = True
            End Select

        End If

        '-----------------------------------------------------------

        'pluto:2.11
        If UserList(Userindex).GranPoder > 0 Then daño = daño * 2
        'añadimos % de equipo
        'nati: cambio esto, ya no será por porcentaje.
        'daño = daño + CInt(Porcentaje(daño, DañoEquipoMagico(UserIndex)))
        daño = daño + DañoEquipoMagico(Userindex)

        '¿arma equipada?
        If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then

            If ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).SubTipo = 5 And Npclist(NpcIndex).NPCtype = 79 Then
                daño = daño * 5
                GoTo tuu
                'pluto:7.0 MENOS DAÑO SIN VARA
                ' ElseIf ObjData(UserList(UserIndex).Invent.WeaponEqpObjIndex).SubTipo <> 13 Then
                ' daño = daño - CInt(Porcentaje(daño, 10))
                'End If

                'If ObjData(UserList(userindex).Invent.WeaponEqpObjIndex).SubTipo = 13 Then
                'daño = daño + CInt(Porcentaje(daño, ObjData(UserList(userindex).Invent.WeaponEqpObjIndex).Magia))
                'Else
                'daño = daño - CInt(Porcentaje(daño, 10))
            End If

        End If

tuu:
        '------------------------------
        'pluto:2.17 ettin y rey menos daño magias
        'If (Npclist(NpcIndex).NPCtype = 77 Or Npclist(NpcIndex).NPCtype = 33) And daño > 0 Then daño = CInt(daño / 3)

        'pluto:2.3 quitar esto 1000 por un 0
        'quitar esto
        If UserList(Userindex).flags.Privilegios > 0 Then daño = 0

        'pluto:2.4.5
        If UserList(Userindex).flags.Montura = 1 Then
            Dim pl As Integer
            Dim po As Integer
            'Dim po As Byte
            Dim nivk As Byte
            Dim kk As Byte
            po = UserList(Userindex).flags.ClaseMontura
            'If po = 1 Or po = 5 Then
            'pluto:2.11
            'If po = 1 Then kk = 2
            'If po = 5 Then kk = 3
            nivk = UserList(Userindex).Montura.Nivel(po)
            daño = daño + CInt(Porcentaje(daño, UserList(Userindex).Montura.AtMagico(po))) + 1
            '--------------

            If UserList(Userindex).Montura.AtMagico(po) > 0 Then pl = UserList(Userindex).Montura.Golpe(po) Else pl = 0

            'pluto:6.2
            If UserList(Userindex).Montura.Tipo(po) = 6 Then pl = UserList(Userindex).Montura.Golpe(po)

            Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MinHP - pl

            'Call SendData(ToIndex, userindex, 0, "U2" & daño & "," & pl & "," & Npclist(NpcIndex).Char.CharIndex)
            'Else
            'Call SendData(ToIndex, UserIndex, 0, "U2" & daño)
        End If

        'End If
        '-------

        Call InfoHechizo(Userindex)
        b = True
        Call NpcAtacado(NpcIndex, Userindex)

        If Npclist(NpcIndex).flags.Snd2 > 0 Then Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" _
                                                                                                                 & Npclist(NpcIndex).flags.Snd2)

        'pluto:2.8.0
        If Npclist(NpcIndex).NPCtype = 60 Then daño = daño - CInt(Porcentaje(daño, 50))

        'pluto:7.0 lo muevo detras para dar mas importancia a los modificadores
        daño = CInt(daño * ModMagia(UserList(Userindex).clase))
        'nati: agrego la linea para que divida el golpe empleado al npc por magia. 10% = 1.1
        daño = CInt(daño / 1.1)

        daño = daño + Int(Porcentaje(daño, UserList(Userindex).UserDañoMagiasRaza))

        '[Tite] Pluto:6.0A Le aplico el skill daño magico
        ' daño = daño + CInt(Porcentaje(daño, (CInt(UserList(UserIndex).Stats.UserSkills(DañoMagia) / 10))))
        ' Call SubirSkill(UserIndex, DañoMagia)

        '[\Tite]

        'pluto:7.0 Criticos de ciclopes
        'If UserList(UserIndex).raza = "ciclope" Then
        '   Dim probi As Integer
        '  probi = RandomNumber(1, 100) + CInt((UserList(UserIndex).Stats.UserSkills(suerte) / 40))
        ' If probi > 93 Then
        'Criti = 2
        'GoTo ciclo
        'End If
        'End If

        'pluto:6.0A-----golpes criticos-------------
        If Npclist(NpcIndex).GiveEXP < 37000 Or LogroOro = True Then
            Dim cf As Integer

            cf = 3500

            'If ObjData(UserList(UserIndex).Invent.WeaponEqpObjIndex).proyectil > 0 Then cf = cf + 2000
            'pluto:6.5--------------------
            'Loco = RandomNumber(1, cf)
            'If Loco < (UserList(UserIndex).Stats.UserSkills(suerte) * 5) Then Loco = (UserList(UserIndex).Stats.UserSkills(suerte) * 5)

            '-------------------------
            Critico = RandomNumber(1, cf) - (UserList(Userindex).Stats.UserSkills(suerte) * 5)

            If Critico < 60 Then Criti = 2
            If Critico > 59 And Critico < 109 Then Criti = 3
            If Critico > 108 And Critico < 118 Then Criti = 4
            If Critico > 117 And Critico < 120 Then Criti = 5
        Else
            'pluto:6.5-----------
            'Loco = RandomNumber(1, cf + 7000)
            'If Loco < (UserList(UserIndex).Stats.UserSkills(suerte) * 10) Then Loco = (UserList(UserIndex).Stats.UserSkills(suerte) * 10)
            '---------------------
            Critico = RandomNumber(1, cf + 7000) - (UserList(Userindex).Stats.UserSkills(suerte) * 10)

            If Critico < 60 Then Criti = 2
            If Critico > 59 And Critico < 109 Then Criti = 3
            If Critico > 108 And Critico < 118 Then Criti = 4

        End If

        '------------------------------------------------
        'EZE BERSERKER
        Dim Lele As Integer
        Lele = UserList(Userindex).Stats.MaxHP / 3



        'If UserList(Userindex).Stats.MinHP < Lele And UserList(Userindex).raza = "Orco" Then

         '   daño = daño * 1.5


        'End If

ciclo:

        If UserList(Userindex).flags.SegCritico = True Then Criti = 1

        If Criti > 0 And Criti <> 5 Then daño = daño * Criti

        'pluto:6.2 mortales no en piñatas y raids
        If Criti = 5 And Npclist(NpcIndex).Raid = 0 And Npclist(NpcIndex).numero <> 664 Then Npclist( _
           NpcIndex).Stats.MinHP = 0

        Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MinHP - daño

        If Npclist(NpcIndex).Stats.MinHP < 0 Then Npclist(NpcIndex).Stats.MinHP = 0

        'pluto:2.10
        'Call SendData(ToIndex, UserIndex, 0, "U2" & daño & "," & pl & "," & Npclist(NpcIndex).Char.CharIndex)
        Call SendData(ToIndex, Userindex, 0, "U2" & daño & "," & pl & "," & Npclist(NpcIndex).Char.CharIndex & "," & _
                                             Npclist(NpcIndex).Name & "," & Npclist(NpcIndex).Stats.MinHP & "," & Npclist(NpcIndex).Stats.MaxHP & _
                                             "," & Criti)

        'pluto:6.0A
        If Npclist(NpcIndex).Raid > 0 Then

            Dim nn As Byte
            Dim MinPc As npc
            MinPc = Npclist(NpcIndex)
            Dim Porvida As Integer
            Porvida = Int((Npclist(NpcIndex).Stats.MinHP * 100) / Npclist(NpcIndex).Stats.MaxHP)

            Select Case Porvida

            Case Is < 10

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 1 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 0

                End If

            Case Is < 20

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 2 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 1

                End If

            Case Is < 30

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 3 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 2

                End If

            Case Is < 40

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 4 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 3

                End If

            Case Is < 50

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 5 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 4

                End If

            Case Is < 60

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 6 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 5

                End If

            Case Is < 70

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 7 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 6

                End If

            Case Is < 80

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 8 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 7

                End If

            Case Is < 90

                If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 9 Then

                    For nn = 1 To 5

                        If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                    Next
                    RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 8

                End If

            End Select

            '    If RandomNumber(1, 200) < Npclist(NpcIndex).Raid Then
            'Dim recu As Integer
            'recu = RandomNumber(1, Npclist(NpcIndex).Raid * 20)
            'Call AddtoVar(Npclist(NpcIndex).Stats.MinHP, recu, Npclist(NpcIndex).Stats.MaxHP)
            '   Else
            'recu = 0
            '   End If
            'Call SendData(toParty, UserIndex, UserList(UserIndex).Pos.Map, "H4" & Npclist(NpcIndex).Char.CharIndex & "," & Npclist(NpcIndex).Stats.MinHP & "," & recu)
        End If

        'SendData ToIndex, UserIndex, 0, "||Causas " & daño & " de daño " & "(" & Npclist(NpcIndex).Stats.MinHP & "/" & Npclist(NpcIndex).Stats.MaxHP & ")" & FONTTYPENAMES.FONTTYPE_fight
        'pluto: npc en la casa
        If (Npclist(NpcIndex).Pos.Map = 171 Or Npclist(NpcIndex).Pos.Map = 177) And (Npclist(NpcIndex).Stats.MinHP < _
                                                                                     Npclist(NpcIndex).Stats.MaxHP / 3) Then
            Dim Ale
            Ale = RandomNumber(1, 500)

            Select Case Ale

                'npc se quitaparalisis
            Case Is < 20

                If Npclist(NpcIndex).flags.Paralizado > 0 Then
                    Npclist(NpcIndex).flags.Paralizado = 0
                    Npclist(NpcIndex).Contadores.Paralisis = 0
                    Call SendData(ToMap, 0, Npclist(NpcIndex).Pos.Map, "TW" & 115)
                    Call SendData(ToIndex, Userindex, 0, "|| Los Espiritus de la casa han desparalizado al " & _
                                                         Npclist(NpcIndex).Name & "´" & FontTypeNames.FONTTYPE_talk)

                End If

                'Pluto:2.20 añado >0 // npc se cura
            Case 21 To 30

                If Npclist(NpcIndex).Stats.MinHP > 0 And Npclist(NpcIndex).Stats.MinHP < Npclist( _
                   NpcIndex).Stats.MaxHP Then
                    Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MaxHP
                    Call SendData(ToMap, 0, Npclist(NpcIndex).Pos.Map, "TW" & 115)
                    Call SendData2(ToPCArea, Userindex, Npclist(NpcIndex).Pos.Map, 22, Npclist( _
                                                                                       NpcIndex).Char.CharIndex & "," & Hechizos(32).FXgrh & "," & Hechizos(32).loops)
                    Call SendData(ToIndex, Userindex, 0, "|| Los Espiritus de la casa han Sanado al " & Npclist( _
                                                         NpcIndex).Name & "´" & FontTypeNames.FONTTYPE_talk)

                End If

                'npc saca npcs
            Case 31 To 40
                Call SpawnNpc(550, UserList(Userindex).Pos, True, False)
                Call SendData(ToMap, 0, Npclist(NpcIndex).Pos.Map, "TW" & 115)
                Call SendData(ToIndex, Userindex, 0, "|| Los Espiritus de invocan una ayuda al " & Npclist( _
                                                     NpcIndex).Name & "´" & FontTypeNames.FONTTYPE_talk)

            End Select

        End If

        If Npclist(NpcIndex).Stats.MinHP < 1 Then
            Npclist(NpcIndex).Stats.MinHP = 0

            If Npclist(NpcIndex).Name = "Rey del Castillo" Or Npclist(NpcIndex).Name = "Defensor Fortaleza" Then _
               Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MaxHP
            Call MuereNpc(NpcIndex, Userindex)

        End If

        'End If
        'ataque area

    ElseIf Hechizos(hindex).SubeHP = 4 Then

        'pluto:6.5
        If Npclist(NpcIndex).Attackable = 0 Or Npclist(NpcIndex).MaestroUser > 0 Then
            Call SendData(ToIndex, Userindex, 0, "L5")
            Exit Sub

        End If

        Dim X As Integer
        Dim Y As Integer
        Dim H As Integer

        H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)

        'p = MapData(UserList(UserIndex).Pos.Map, X, Y).NpcIndex
        For Y = UserList(Userindex).Pos.Y - MinYBorder + 1 To UserList(Userindex).Pos.Y + MinYBorder - 1
            For X = UserList(Userindex).Pos.X - MinXBorder + 1 To UserList(Userindex).Pos.X + MinXBorder - 1

                If X > 0 And Y > 0 And X < 101 And Y < 101 Then

                    If MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex > 0 Then
                        'pluto:2.19----------------------------------
                        Dim Bc As Integer
                        Bc = MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex

                        'pluto:6.5
                        If Npclist(Bc).flags.PoderEspecial2 > 0 Or Npclist(Bc).Raid > 0 Then GoTo alli
                        '------------------------------------------------
                        daño = RandomNumber(Hechizos(hindex).MinHP, Hechizos(hindex).MaxHP)

                        'pluto:6.0----------------------------------------
                        If UserList(Userindex).Remort = 0 Then
                            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
                        Else

                            If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
                                'Dim Topito As Long
                                Topito = UserList(Userindex).Stats.ELV * 3.65

                                If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
                                daño = daño + Porcentaje(daño, Topito)
                            Else
                                daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

                            End If

                        End If

                        '-------------------------------------------------    'pluto:2.3
                        If UserList(Userindex).flags.Privilegios > 0 Then daño = 0
                        'pluto:6.0A quito rey daño magias
                        'pluto:2.18 ettin menos daño magias
                        'If Npclist(Bc).NPCtype = 77 And daño > 0 Then daño = CInt(daño / 3)

                        If Npclist(Bc).Attackable = 0 Then GoTo alli

                        'pluto:2.18
                        If Npclist(Bc).MaestroUser > 0 Then GoTo alli

                        Call InfoHechizo(Userindex)
                        Call SendData2(ToPCArea, Userindex, Npclist(Bc).Pos.Map, 22, Npclist(Bc).Char.CharIndex & "," _
                                                                                     & Hechizos(H).FXgrh & "," & Hechizos(H).loops)

                        Call NpcAtacado(MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex, Userindex)

                        If Npclist(MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex).flags.Snd2 > 0 Then Call _
                           SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Npclist(MapData( _
                                                                                                     UserList(Userindex).Pos.Map, X, Y).NpcIndex).flags.Snd2)
                        b = True

                        Npclist(MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex).Stats.MinHP = Npclist(MapData( _
                                                                                                           UserList(Userindex).Pos.Map, X, Y).NpcIndex).Stats.MinHP - daño
                        SendData ToIndex, Userindex, 0, "||Le has causado " & daño & " puntos de daño a la criatura!" _
                                                        & "(" & Npclist(MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex).Stats.MinHP & _
                                                        "/" & Npclist(MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex).Stats.MaxHP & ")" _
                                                        & "´" & FontTypeNames.FONTTYPE_FIGHT

                        If Npclist(Bc).Stats.MinHP < 1 Then
                            Npclist(Bc).Stats.MinHP = 0

                            If Npclist(Bc).Name = "Rey del Castillo" Or Npclist(Bc).Name = "Defensor Fortaleza" Then _
                               Npclist(Bc).Stats.MinHP = Npclist(MapData(UserList(Userindex).Pos.Map, X, _
                                                                         Y).NpcIndex).Stats.MaxHP
                            Call MuereNpc(Bc, Userindex)

                        End If

alli:

                    End If

                End If

            Next X
        Next Y

        'ataque zona cercana usuario

    ElseIf Hechizos(hindex).SubeHP = 3 Then

        'pluto:6.5
        If Npclist(NpcIndex).Attackable = 0 Or Npclist(NpcIndex).MaestroUser > 0 Then
            Call SendData(ToIndex, Userindex, 0, "L5")
            Exit Sub

        End If

        If Npclist(NpcIndex).Pos.X > UserList(Userindex).Pos.X + 1 Or Npclist(NpcIndex).Pos.X < UserList( _
           Userindex).Pos.X - 1 Or Npclist(NpcIndex).Pos.Y > UserList(Userindex).Pos.Y + 10 Or Npclist( _
           NpcIndex).Pos.Y < UserList(Userindex).Pos.Y - 10 Then
            Call SendData(ToIndex, Userindex, 0, "L2")
            Exit Sub

        End If

        ' Dim X As Integer
        'Dim Y As Integer
        'Dim H As Integer

        H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)

        'p = MapData(UserList(UserIndex).Pos.Map, X, Y).NpcIndex
        For Y = UserList(Userindex).Pos.Y - 2 To UserList(Userindex).Pos.Y + 2
            For X = UserList(Userindex).Pos.X - 2 To UserList(Userindex).Pos.X + 2

                If X > 0 And Y > 0 And X < 101 And Y < 101 Then
                    If MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex > 0 Then
                        'pluto:2.19----------------------------------
                        'Dim Bc As Integer
                        Bc = MapData(UserList(Userindex).Pos.Map, X, Y).NpcIndex

                        'pluto:6.5
                        If Npclist(Bc).flags.PoderEspecial2 > 0 Or Npclist(Bc).Raid > 0 Then GoTo alli3
                        '------------------------------------------------

                        daño = RandomNumber(Hechizos(hindex).MinHP, Hechizos(hindex).MaxHP)

                        'pluto:6.0----------------------------------------
                        If UserList(Userindex).Remort = 0 Then
                            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
                        Else

                            If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
                                ' Dim Topito As Long
                                Topito = UserList(Userindex).Stats.ELV * 3.65

                                If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
                                daño = daño + Porcentaje(daño, Topito)
                            Else
                                daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

                            End If

                        End If

                        '-------------------------------------------------    'pluto:2.3
                        If UserList(Userindex).flags.Privilegios > 0 Then daño = 0
                        'pluto:2.18 ettin y rey menos daño magias
                        'If (Npclist(Bc).NPCtype = 77 Or Npclist(Bc).NPCtype = 33) And daño > 0 Then daño = CInt(daño / 3)

                        If Npclist(Bc).Attackable = 0 Then GoTo alli3

                        'pluto:2.18
                        If Npclist(Bc).MaestroUser > 0 Then GoTo alli3

                        Call InfoHechizo(Userindex)
                        Call SendData2(ToPCArea, Userindex, Npclist(Bc).Pos.Map, 22, Npclist(Bc).Char.CharIndex & "," _
                                                                                     & Hechizos(H).FXgrh & "," & Hechizos(H).loops)

                        Call NpcAtacado(Bc, Userindex)

                        If Npclist(Bc).flags.Snd2 > 0 Then Call SendData(ToPCArea, Userindex, UserList( _
                                                                                              Userindex).Pos.Map, "TW" & Npclist(Bc).flags.Snd2)
                        b = True

                        Npclist(Bc).Stats.MinHP = Npclist(Bc).Stats.MinHP - daño
                        SendData ToIndex, Userindex, 0, "||Le has causado " & daño & " puntos de daño a la criatura!" _
                                                        & "(" & Npclist(Bc).Stats.MinHP & "/" & Npclist(Bc).Stats.MaxHP & ")" & "´" & _
                                                        FontTypeNames.FONTTYPE_FIGHT

                        If Npclist(Bc).Stats.MinHP < 1 Then
                            Npclist(Bc).Stats.MinHP = 0

                            If Npclist(Bc).Name = "Rey del Castillo" Or Npclist(Bc).Name = "Defensor Fortaleza" Then _
                               Npclist(Bc).Stats.MinHP = Npclist(Bc).Stats.MaxHP
                            Call MuereNpc(Bc, Userindex)

                        End If

alli3:

                    End If

                End If

            Next X
        Next Y

    End If

    'pluto:2.5.0
    Exit Sub
errhandler:
    Call LogError("Error en HechizoPropNPC: " & UserList(Userindex).Name & " -> " & Npclist(NpcIndex).Name & " -> " & _
                  Hechizos(hindex).Nombre & " " & Err.Description)

End Sub

Sub InfoHechizo(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim H  As Integer
    Dim HH As Byte

    With UserList(Userindex)
        H = .Stats.UserHechizos(.flags.Hechizo)

        'Hechizos(H).FXgrh = 95
        'Hechizos(H).loops = 2

        ' Call DecirPalabrasMagicas(Hechizos(H).PalabrasMagicas, UserIndex)

        'pluto:6.0A------------------------------------------------------------
        If .flags.TargetUser > 0 Then
            Call SendData2(ToPCArea, Userindex, .Pos.Map, 76, UserList(.flags.TargetUser).Char.CharIndex & "," & H & "," & .Char.CharIndex)

        ElseIf .flags.TargetNpc > 0 Then
            Call SendData2(ToPCArea, Userindex, .Pos.Map, 76, Npclist(.flags.TargetNpc).Char.CharIndex & "," & H & "," & .Char.CharIndex)
        Else    'terreno
            Call SendData2(ToPCArea, Userindex, .Pos.Map, 76, .Char.CharIndex & "," & H & "," & .Char.CharIndex)

        End If

        '----------------------------------------------------------------------

        'Call SendData(ToPCArea, UserIndex, .Pos.Map, "||7°" & Hechizos(H).PalabrasMagicas & "°" & .Char.CharIndex)
        ' Call SendData(ToPCArea, UserIndex, .Pos.Map, "TW" & Hechizos(H).WAV)

        If .flags.TargetUser > 0 Then
            Call SendData2(ToPCArea, Userindex, .Pos.Map, 22, UserList(.flags.TargetUser).Char.CharIndex & "," & Hechizos(H).FXgrh & "," & Hechizos( _
                    H).loops)
                
        ElseIf .flags.TargetNpc > 0 Then
            Call SendData2(ToPCArea, Userindex, Npclist(.flags.TargetNpc).Pos.Map, 22, Npclist(.flags.TargetNpc).Char.CharIndex & "," & Hechizos( _
                    H).FXgrh & "," & Hechizos(H).loops)

        End If

        If .flags.TargetUser > 0 Then

            If Userindex <> .flags.TargetUser Then
                Call SendData(ToIndex, Userindex, 0, "S5" & H & "," & UserList(.flags.TargetUser).Name)
                Call SendData(ToIndex, .flags.TargetUser, 0, "S6" & H & "," & .Name)

                'Call SendData(ToIndex, UserIndex, 0, "||" & Hechizos(H).HechizeroMsg & " " & UserList(.flags.TargetUser).Name & FONTTYPENAMES.FONTTYPE_fight)
                'Call SendData(ToIndex, .flags.TargetUser, 0, "||" & .Name & " " & Hechizos(H).TargetMsg & FONTTYPENAMES.FONTTYPE_fight)
            Else
                Call SendData(ToIndex, Userindex, 0, "S4" & H)

                'Call SendData(ToIndex, UserIndex, 0, "||" & Hechizos(H).PropioMsg & FONTTYPENAMES.FONTTYPE_fight)
            End If

        ElseIf .flags.TargetNpc > 0 Then
            Call SendData(ToIndex, Userindex, 0, "S7" & H)

        End If

    End With

    Exit Sub
fallo:
    Call LogError("infohechizo " & Err.number & " D: " & Err.Description)

End Sub

Sub HechizoPropUsuario(ByVal Userindex As Integer, ByRef b As Boolean)

    On Error GoTo fallo

    Dim HH As Integer
    Dim H As Integer
    Dim daño As Integer
    Dim tempChr As Integer
    Dim Topito As Long

    H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)
    tempChr = UserList(Userindex).flags.TargetUser

    'nati: Agrego esto para cuando te ataquen dejes de meditar.

    If UserList(tempChr).flags.Meditando Then
        Call SendData(ToIndex, tempChr, 0, "G7")
        Call SendData2(ToIndex, tempChr, 0, 54)
        Call SendData2(ToIndex, tempChr, 0, 15, UserList(tempChr).Pos.X & "," & UserList(tempChr).Pos.Y)
        UserList(tempChr).flags.Meditando = False
        UserList(tempChr).Char.FX = 0
        UserList(tempChr).Char.loops = 0
        'pluto:bug meditar
        Call SendData2(ToMap, tempChr, UserList(tempChr).Pos.Map, 22, UserList(tempChr).Char.CharIndex & "," & 0 & _
                                                                      "," & 0)

    End If

    'nati: Agrego esto para cuando te ataquen dejes de meditar.

    'nati: Agrego esto para cuando te ataquen dejes de descansar.
    If UserList(tempChr).flags.Descansar Then
        Call SendData(ToIndex, tempChr, 0, "||Te levantas." & "´" & FontTypeNames.FONTTYPE_INFO)
        UserList(tempChr).flags.Descansar = False
        Call SendData2(ToIndex, tempChr, 0, 41)

    End If

    'nati: Agrego esto para cuando te ataquen dejes de descansar.

    'pluto:6.0A
    'If Hechizos(H).Noesquivar = 1 Then GoTo noss
    'skill EVITA MAGIA
    'Dim oo As Byte
    'oo = RandomNumber(1, 100)
    'Call SubirSkill(tempChr, EvitaMagia)
    'If oo < CInt((UserList(tempChr).Stats.UserSkills(EvitaMagia) / 10) + 2) And UserList(tempChr).flags.Muerto = 0 Then
    'Call SendData(ToIndex, UserIndex, 0, "|| Se ha Resistido a la Magia !!" & FONTTYPENAMES.FONTTYPE_fight)
    'Call SendData(ToIndex, tempChr, 0, "|| Has Resistido una Magia !!" & FONTTYPENAMES.FONTTYPE_fight)
    'b = True
    'Exit Sub
    'End If
    '--------------------

noss:

    'Hambre
    If Hechizos(H).SubeHam = 1 Then

        Call InfoHechizo(Userindex)

        daño = RandomNumber(Hechizos(H).MinHam, Hechizos(H).MaxHam)

        Call AddtoVar(UserList(tempChr).Stats.MinHam, daño, UserList(tempChr).Stats.MaxHam)
        'pluto:
        UserList(tempChr).flags.Hambre = 0
        UserList(tempChr).flags.Sed = 0

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has restaurado " & daño & " puntos de hambre a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha restaurado " & daño & _
                                               " puntos de hambre." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has restaurado " & daño & " puntos de hambre." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        Call EnviarHambreYsed(tempChr)
        b = True

    ElseIf Hechizos(H).SubeHam = 2 Then

        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

        If Userindex <> tempChr Then
            Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

        End If

        Call InfoHechizo(Userindex)

        daño = RandomNumber(Hechizos(H).MinHam, Hechizos(H).MaxHam)
        UserList(tempChr).Stats.MinHam = UserList(tempChr).Stats.MinHam - daño

        If UserList(tempChr).Stats.MinHam < 1 Then UserList(tempChr).Stats.MinHam = 1

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has dejado con " & UserList(tempChr).Stats.MinHam & _
                                                 " puntos de hambre a " & UserList(tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha dejado con " & UserList( _
                                               tempChr).Stats.MinHam & " puntos de hambre." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has dejado con " & UserList(tempChr).Stats.MinHam & _
                                                 " puntos de hambre." & "´" & FontTypeNames.FONTTYPE_FIGHT)

        End If

        Call EnviarHambreYsed(tempChr)

        b = True

        If UserList(tempChr).Stats.MinHam < 1 Then
            UserList(tempChr).Stats.MinHam = 0
            UserList(tempChr).flags.Hambre = 1

        End If

    End If

    'Sed
    If Hechizos(H).SubeSed = 1 Then

        Call InfoHechizo(Userindex)

        Call AddtoVar(UserList(tempChr).Stats.MinAGU, daño, UserList(tempChr).Stats.MaxAGU)

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has restaurado " & daño & " puntos de sed a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha restaurado " & daño & _
                                               " puntos de sed." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has restaurado " & daño & " puntos de sed." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        Call EnviarHambreYsed(tempChr)
        b = True

    ElseIf Hechizos(H).SubeSed = 2 Then

        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

        If Userindex <> tempChr Then
            Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

        End If

        Call InfoHechizo(Userindex)

        UserList(tempChr).Stats.MinAGU = UserList(tempChr).Stats.MinAGU - daño

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has quitado " & daño & " puntos de sed a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha quitado " & daño & _
                                               " puntos de sed." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has quitado " & daño & " puntos de sed." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        If UserList(tempChr).Stats.MinAGU < 1 Then
            UserList(tempChr).Stats.MinAGU = 0
            UserList(tempChr).flags.Sed = 1

        End If

        b = True

    End If

    'nati: agrego que si es ELFO DROW no pueda doparse
    If Not UserList(tempChr).raza = "asd" Then

        ' <-------- Agilidad ---------->
        If Hechizos(H).SubeAgilidad = 1 Then

            Call InfoHechizo(Userindex)

            'pluto:2.15
            If UserList(tempChr).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, tempChr, 0, "S1")

            End If

            daño = RandomNumber(Hechizos(H).MinAgilidad, Hechizos(H).MaxAgilidad)

            UserList(tempChr).flags.DuracionEfecto = 1200
            Call AddtoVar(UserList(tempChr).Stats.UserAtributos(Agilidad), daño, UserList( _
                                                                                 tempChr).Stats.UserAtributosBackUP(Agilidad) + 13)
            UserList(tempChr).flags.TomoPocion = True
            b = True

        ElseIf Hechizos(H).SubeAgilidad = 2 Then

            If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

            If Userindex <> tempChr Then
                Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

            End If

            Call InfoHechizo(Userindex)

            UserList(tempChr).flags.TomoPocion = True
            daño = RandomNumber(Hechizos(H).MinAgilidad, Hechizos(H).MaxAgilidad)
            UserList(tempChr).flags.DuracionEfecto = 700
            UserList(tempChr).Stats.UserAtributos(Agilidad) = UserList(tempChr).Stats.UserAtributos(Agilidad) - daño

            If UserList(tempChr).Stats.UserAtributos(Agilidad) < MINATRIBUTOS Then UserList( _
               tempChr).Stats.UserAtributos(Agilidad) = MINATRIBUTOS
            b = True

        End If

    ElseIf Len(UserList(tempChr).Padre) > 0 Then    ' <--- AGREGANDO ESTO, LE ESTOY DICIENDO QUE SI ES BEBE, SI QUE SE PUEDA DOPAR.

        ' <-------- Agilidad ---------->
        If Hechizos(H).SubeAgilidad = 1 Then

            Call InfoHechizo(Userindex)

            'pluto:2.15
            If UserList(tempChr).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, tempChr, 0, "S1")

            End If

            daño = RandomNumber(Hechizos(H).MinAgilidad, Hechizos(H).MaxAgilidad)

            UserList(tempChr).flags.DuracionEfecto = 1200
            Call AddtoVar(UserList(tempChr).Stats.UserAtributos(Agilidad), daño, UserList( _
                                                                                 tempChr).Stats.UserAtributosBackUP(Agilidad) + 13)
            UserList(tempChr).flags.TomoPocion = True
            b = True

        ElseIf Hechizos(H).SubeAgilidad = 2 Then

            If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

            If Userindex <> tempChr Then
                Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

            End If

            Call InfoHechizo(Userindex)

            UserList(tempChr).flags.TomoPocion = True
            daño = RandomNumber(Hechizos(H).MinAgilidad, Hechizos(H).MaxAgilidad)
            UserList(tempChr).flags.DuracionEfecto = 700
            UserList(tempChr).Stats.UserAtributos(Agilidad) = UserList(tempChr).Stats.UserAtributos(Agilidad) - daño

            If UserList(tempChr).Stats.UserAtributos(Agilidad) < MINATRIBUTOS Then UserList( _
               tempChr).Stats.UserAtributos(Agilidad) = MINATRIBUTOS
            b = True

        End If

    End If

    'agrego que si es ELFO DROW no pueda doparse
    ' <-------- Fuerza ---------->
    'nati: agrego que si es ENANO no se dope.
    If Not UserList(tempChr).raza = "asd" Then
        If Hechizos(H).SubeFuerza = 1 Then
            Call InfoHechizo(Userindex)
            daño = RandomNumber(Hechizos(H).MinFuerza, Hechizos(H).MaxFuerza)

            'pluto:2.15
            If UserList(tempChr).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, tempChr, 0, "S1")

            End If

            UserList(tempChr).flags.DuracionEfecto = 1200

            Call AddtoVar(UserList(tempChr).Stats.UserAtributos(Fuerza), daño, UserList( _
                                                                               tempChr).Stats.UserAtributosBackUP(Fuerza) + 13)
            UserList(tempChr).flags.TomoPocion = True
            b = True

        ElseIf Hechizos(H).SubeFuerza = 2 Then

            If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

            If Userindex <> tempChr Then
                Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

            End If

            Call InfoHechizo(Userindex)

            UserList(tempChr).flags.TomoPocion = True

            daño = RandomNumber(Hechizos(H).MinFuerza, Hechizos(H).MaxFuerza)
            UserList(tempChr).flags.DuracionEfecto = 700
            UserList(tempChr).Stats.UserAtributos(Fuerza) = UserList(tempChr).Stats.UserAtributos(Fuerza) - daño

            If UserList(tempChr).Stats.UserAtributos(Fuerza) < MINATRIBUTOS Then UserList( _
               tempChr).Stats.UserAtributos(Fuerza) = MINATRIBUTOS
            b = True

        End If

    ElseIf Len(UserList(tempChr).Padre) > 0 Then    ' <--- AGREGANDO ESTO, LE ESTOY DICIENDO QUE SI TIENE PADRE (ENTONCES ES HIJO), SI QUE SE PUEDA DOPAR.

        If Hechizos(H).SubeFuerza = 1 Then
            Call InfoHechizo(Userindex)
            daño = RandomNumber(Hechizos(H).MinFuerza, Hechizos(H).MaxFuerza)

            'pluto:2.15
            If UserList(tempChr).flags.DuracionEfecto = 0 Then
                Call SendData(ToIndex, tempChr, 0, "S1")

            End If

            UserList(tempChr).flags.DuracionEfecto = 1200

            Call AddtoVar(UserList(tempChr).Stats.UserAtributos(Fuerza), daño, UserList( _
                                                                               tempChr).Stats.UserAtributosBackUP(Fuerza) + 13)
            UserList(tempChr).flags.TomoPocion = True
            b = True

        ElseIf Hechizos(H).SubeFuerza = 2 Then

            If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

            If Userindex <> tempChr Then
                Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

            End If

            Call InfoHechizo(Userindex)

            UserList(tempChr).flags.TomoPocion = True

            daño = RandomNumber(Hechizos(H).MinFuerza, Hechizos(H).MaxFuerza)
            UserList(tempChr).flags.DuracionEfecto = 700
            UserList(tempChr).Stats.UserAtributos(Fuerza) = UserList(tempChr).Stats.UserAtributos(Fuerza) - daño

            If UserList(tempChr).Stats.UserAtributos(Fuerza) < MINATRIBUTOS Then UserList( _
               tempChr).Stats.UserAtributos(Fuerza) = MINATRIBUTOS
            b = True

        End If

    End If

    'Salud
    If Hechizos(H).SubeHP = 1 Then
        daño = RandomNumber(Hechizos(H).MinHP, Hechizos(H).MaxHP)

        'pluto:6.0----------------------------------------
        If UserList(Userindex).Remort = 0 Then
            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
        Else

            If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
                'Dim Topito As Long
                Topito = UserList(Userindex).Stats.ELV * 3.65

                If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
                daño = daño + Porcentaje(daño, Topito)
            Else
                daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

            End If

        End If

        '-------------------------------------------------
        Call InfoHechizo(Userindex)

        Call AddtoVar(UserList(tempChr).Stats.MinHP, daño, UserList(tempChr).Stats.MaxHP)

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has restaurado " & daño & " puntos de vida a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha restaurado " & daño & _
                                               " puntos de vida." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has restaurado " & daño & " puntos de vida." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        b = True

    ElseIf Hechizos(H).SubeHP = 2 Then

        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub
        If Userindex = tempChr Then
            Call SendData(ToIndex, Userindex, 0, "L6")
            Exit Sub

        End If

        daño = RandomNumber(Hechizos(H).MinHP, Hechizos(H).MaxHP)

        'PLUTO
        If UCase$(Hechizos(H).Nombre) = "RAYO GM" Then
            'pluto:2.14
            Call LogGM(UserList(Userindex).Name, "RAYO GM: " & UserList(tempChr).Name)
            daño = 500

        End If

        '------------------------------
        'pluto:7.0 extra monturas subido para calculo sobre daño base
        If UserList(Userindex).flags.Montura = 1 Then

            Dim oo As Integer

            oo = UserList(Userindex).flags.ClaseMontura

            'pluto:7.0----------
            daño = daño + CInt(Porcentaje(daño, UserList(Userindex).Montura.AtMagico(oo))) + 1

            '------------------
            If daño < 1 Then daño = 1

        End If

        If UserList(tempChr).flags.Montura = 1 Then
            oo = UserList(tempChr).flags.ClaseMontura
            'kk = 0
            'If oo = 1 Then kk = 2
            'If oo = 5 Then kk = 3
            'nivk = UserList(tempChr).Montura.Nivel(oo)
            daño = daño - CInt(Porcentaje(daño, UserList(tempChr).Montura.DefMagico(oo))) - 1

            If daño < 1 Then daño = 1

        End If

        '------------fin pluto:2.13-------------------

        ' daño = daño + Porcentaje(daño, 3 * UserList(UserIndex).Stats.ELV)

        'pluto:6.0----------------------------------------
        If UserList(Userindex).Remort = 0 Then
            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
        Else

            If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
                'Dim Topito As Long
                Topito = UserList(Userindex).Stats.ELV * 3.65

                If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
                daño = daño + Porcentaje(daño, Topito)
            Else
                daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

            End If

        End If

        '-------------------------------------------------

        'pluto:6.0A Skills------------------------
        'daño = daño + CInt(Porcentaje(daño, (CInt(UserList(UserIndex).Stats.UserSkills(DañoMagia) / 10))))
        'daño = daño - CInt(Porcentaje(daño, (CInt(UserList(tempChr).Stats.UserSkills(DefMagia) / 10))))
        'Call SubirSkill(tempChr, DefMagia)
        'Call SubirSkill(UserIndex, DañoMagia)
        '---------------------------------------------------------------
        If UserList(tempChr).flags.Angel > 0 Then daño = CInt(daño - (daño * 0.1))
        If UserList(Userindex).flags.Demonio > 0 Then daño = CInt(daño + (daño * 0.1))

        'pluto:2.11
        If UserList(Userindex).GranPoder > 0 Then daño = CInt(daño * 1.4)

        'EZE BERSERKER
        Dim Lele As Integer
        Lele = UserList(Userindex).Stats.MaxHP / 3


        'If UserList(Userindex).Stats.MinHP < Lele And UserList(Userindex).raza = "Orco" Then

         '   daño = daño * 1.5


        'End If



        'pluto:2.16
        If UserList(tempChr).flags.Protec > 0 Then daño = daño - CInt(Porcentaje(daño, UserList(tempChr).flags.Protec))
        'pluto:2.4.1
        Dim obj As ObjData

        If UserList(tempChr).Invent.AnilloEqpObjIndex > 0 Then
            If ObjData(UserList(tempChr).Invent.AnilloEqpObjIndex).SubTipo = 4 Then daño = daño - CInt(daño / 30)

        End If

        'pluto:7.0
        If UserList(tempChr).Invent.ArmourEqpObjIndex > 0 Then
            daño = daño - ObjData(UserList(tempChr).Invent.ArmourEqpObjIndex).Defmagica

            If daño < 1 Then daño = 1

        End If

        'nati: Cuestion de balance, si no lleva ropa le hara un 15% de daño extra.
        If UserList(tempChr).Invent.ArmourEqpObjIndex = 0 Then
            daño = daño + CInt(Porcentaje(daño, 15))

        End If

        'nati: Cuestion de balance, si no lleva ropa le hara un 15% de daño extra.

        'pluto:6.0A---------------------
        'If UserList(UserIndex).Invent.WeaponEqpObjIndex > 0 Then
        'If ObjData(UserList(UserIndex).Invent.WeaponEqpObjIndex).SubTipo = 13 Then
        ' daño = daño + CInt(Porcentaje(daño, ObjData(UserList(userindex).Invent.WeaponEqpObjIndex).Magia))
        'Else
        'daño = daño - CInt(Porcentaje(daño, 10))

        'End If
        'añadimos % de equipo
        'nati: cambio esto, ya no será por porcentaje.
        'daño = daño + CInt(Porcentaje(daño, DañoEquipoMagico(UserIndex)))
        daño = daño + DañoEquipoMagico(Userindex)

        'pluto:7.0 MENOS DAÑO SIN VARA
        'If UserList(UserIndex).Invent.WeaponEqpObjIndex > 0 Then
        '   If ObjData(UserList(UserIndex).Invent.WeaponEqpObjIndex).SubTipo <> 13 Then
        '  daño = daño - CInt(Porcentaje(daño, 10))
        ' End If
        'End If

tuu:

        'pluto:7.0 lo muevo detras para aumentar importancia de modificadores
        daño = CInt(daño * ModMagia(UserList(Userindex).clase))
        daño = CInt(daño / ModMagia(UserList(tempChr).clase))
        daño = daño - CInt(Porcentaje(daño, UserList(tempChr).UserDefensaMagiasRaza))
        daño = daño + CInt(Porcentaje(daño, UserList(Userindex).UserDañoMagiasRaza))
        

        '------------------------------------------------------------------------------
        'nati: agrego el +20% del Berseker en magias
       ' If UserList(tempChr).raza = "Orco" And UserList(tempChr).Counters.Morph > 0 Then
        '    daño = daño + CInt(Porcentaje(daño, 20))

        'End If

        'nati: fin
        'nati: agrego el -20% del Berseker
       ' If UserList(Userindex).raza = "Orco" And UserList(Userindex).Counters.Morph > 0 Then
        '    daño = daño + CInt(Porcentaje(daño, 20))

        'End If
        
        'Debug.Print daño
        
        If UserList(tempChr).raza = "Humano" Then
        daño = daño - CInt(Porcentaje(daño, 5))
        End If
        
        If UserList(tempChr).raza = "Tauros" Then
        daño = daño - CInt(Porcentaje(daño, 5))
        End If
        
        'Debug.Print daño & "Antes"
        'balance de daño global para todas las clases y razas
        daño = daño - CInt(Porcentaje(daño, 20))
        
        'Debug.Print daño & "Despues"
        
        'Debug.Print daño

        'nati:fin berseker
        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

        If Userindex <> tempChr Then
            Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

        End If

        Call InfoHechizo(Userindex)
        

        ''' daño magia aca lele
        ''''' lele el orco probabilidad de evitar daño
        Dim bup As Byte
        If UserList(tempChr).raza = "Orco" Then
            
            bup = RandomNumber(1, 10)
            If bup = 8 Then
                '' puse cero xq no estoy seguro de q hace
                UserList(tempChr).Stats.MinHP = UserList(tempChr).Stats.MinHP - 0

                Call SendData(ToIndex, Userindex, 0, "||No le has quitado puntos de vida a " & UserList( _
                                                     tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
                Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha quitado " & 0 & _
                                                   " puntos de vida." & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Else
                UserList(tempChr).Stats.MinHP = UserList(tempChr).Stats.MinHP - daño

                Call SendData(ToIndex, Userindex, 0, "||Le has quitado " & daño & " puntos de vida a " & UserList( _
                                                     tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
                Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha quitado " & daño & _
                                                   " puntos de vida." & "´" & FontTypeNames.FONTTYPE_FIGHT)

            End If
        Else
            UserList(tempChr).Stats.MinHP = UserList(tempChr).Stats.MinHP - daño

            Call SendData(ToIndex, Userindex, 0, "||Le has quitado " & daño & " puntos de vida a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha quitado " & daño & _
                                               " puntos de vida." & "´" & FontTypeNames.FONTTYPE_FIGHT)

        End If

        If UserList(tempChr).Stats.MinHP < UserList(tempChr).Stats.MaxHP / 3 And UserList(tempChr).raza = "Enano" Then
            'Call SendData2(ToPCArea, tempChr, UserList(tempChr).Pos.Map, 22, UserList( _
                                                                             tempChr).Char.CharIndex & "´" & Hechizos(42).FXgrh & "´" & Hechizos(25).loops)
            Call SendData(ToIndex, tempChr, 0, "||¡¡¡¡¡ HAS ENTRADO EN BERSERKER !!!!!!!" & "´" & _
                                               FontTypeNames.FONTTYPE_INFO)
            Call SendData(ToPCArea, tempChr, UserList(tempChr).Pos.Map, "TW" & SND_IMPACTO_BERSERKER)

        End If

        'pluto:7.0 10% quedar 1 vida en ciclopes

        If UserList(tempChr).Stats.MinHP < 1 And UserList(tempChr).raza = "Abisario" Then
            Dim libup As Byte
            libup = RandomNumber(1, 10)

            If libup = 8 Then UserList(tempChr).Stats.MinHP = 1

        End If
        
        If UserList(tempChr).raza = "Vampiro" Then
            'Dim bup As Byte
            bup = RandomNumber(1, 10)
            'Debug.Print bup
        If bup = 8 Then
            
            'Debug.Print UserList(tempChr).Stats.MinHP & "Antes"
            UserList(tempChr).Stats.MinHP = UserList(tempChr).Stats.MinHP + Porcentaje(UserList(tempChr).Stats.MaxHP, 15)
            'Debug.Print UserList(tempChr).Stats.MinHP & "Despues"
            
        If UserList(tempChr).Stats.MinHP > UserList(tempChr).Stats.MaxHP Then UserList(tempChr).Stats.MinHP = UserList(tempChr).Stats.MaxHP

            End If
            End If


        'Muere
        If UserList(tempChr).Stats.MinHP < 1 Then
            Call ContarMuerte(tempChr, Userindex)
            UserList(tempChr).Stats.MinHP = 0
            Call ActStats(tempChr, Userindex)

            'Call UserDie(tempChr)
        End If

        b = True

    ElseIf Hechizos(H).SubeHP = 4 Then

        'pj area
        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub
        Dim X As Integer
        Dim Y As Integer
        Dim tmpIndex As Integer
        H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)

        If Userindex = tempChr Then
            Call SendData(ToIndex, Userindex, 0, "L6")
            Exit Sub

        End If

        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

        If Userindex <> tempChr Then
            Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

        End If

        '[MerLiNz:X]
        For Y = UserList(Userindex).Pos.Y - MinYBorder + 1 To UserList(Userindex).Pos.Y + MinYBorder - 1
            For X = UserList(Userindex).Pos.X - MinXBorder + 1 To UserList(Userindex).Pos.X + MinXBorder - 1

                If X > 0 And Y > 0 And X < 101 And Y < 101 Then
                    If MapData(UserList(Userindex).Pos.Map, X, Y).Userindex > 0 Then
                        If Criminal(Userindex) = Criminal(MapData(UserList(Userindex).Pos.Map, X, Y).Userindex) Then _
                           GoTo nop
                        tmpIndex = MapData(UserList(Userindex).Pos.Map, X, Y).Userindex

                        If tmpIndex = Userindex Then GoTo nop
                        If UserList(tmpIndex).flags.Privilegios > 0 Then GoTo nop

                        'pluto:hoy
                        If UserList(tmpIndex).flags.Muerto > 0 Then GoTo nop

                        daño = RandomNumber(Hechizos(H).MinHP, Hechizos(H).MaxHP)

                        'pluto:7.0 extra monturas subido arriba
                        If UserList(Userindex).flags.Montura = 1 Then
                            oo = UserList(Userindex).flags.ClaseMontura

                            'pluto:7.0---------
                            daño = daño + CInt(Porcentaje(daño, UserList(Userindex).Montura.AtMagico(oo))) + 1

                            '--------------
                            If daño < 1 Then daño = 1

                        End If

                        If UserList(tempChr).flags.Montura = 1 Then
                            oo = UserList(tempChr).flags.ClaseMontura
                            'kk = 0
                            'If oo = 1 Then kk = 2
                            'If oo = 5 Then kk = 3
                            ' nivk = UserList(tempChr).Montura.Nivel(oo)
                            daño = daño - CInt(Porcentaje(daño, UserList(tempChr).Montura.DefMagico(oo))) - 1

                            If daño < 1 Then daño = 1

                        End If

                        '------------fin pluto:2.13-------------------

                        'daño = daño + Porcentaje(daño, 3 * UserList(UserIndex).Stats.ELV)
                        'pluto:6.0----------------------------------------
                        If UserList(Userindex).Remort = 0 Then
                            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
                        Else

                            If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
                                'Dim Topito As Long
                                Topito = UserList(Userindex).Stats.ELV * 3.65

                                If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
                                daño = daño + Porcentaje(daño, Topito)
                            Else
                                daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

                            End If

                        End If

                        '-------------------------------------------------

                        'pluto:2.18
                        daño = daño - CInt(Porcentaje(daño, UserList(tmpIndex).UserDefensaMagiasRaza))

                        'If UserList(tmpIndex).raza = "Elfo" Then daño = daño - CInt(Porcentaje(daño, 8))
                        'If UserList(tmpIndex).raza = "Humano" Then daño = daño - CInt(Porcentaje(daño, 5))
                        'If UserList(tmpIndex).raza = "Gnomo" Then daño = daño - CInt(Porcentaje(daño, 15))
                        'If UserList(tmpIndex).raza = "Elfo Oscuro" Then daño = daño - CInt(Porcentaje(daño, 5))
                        'pluto:6.0A Skills---------------
                        ' daño = daño + CInt(Porcentaje(daño, (CInt(UserList(UserIndex).Stats.UserSkills(DañoMagia) / 10))))
                        'daño = daño - CInt(Porcentaje(daño, (CInt(UserList(tmpIndex).Stats.UserSkills(DefMagia) / 10))))
                        'Call SubirSkill(tmpIndex, DefMagia)
                        'Call SubirSkill(UserIndex, DañoMagia)
                        '--------------------------------
                        If UserList(tmpIndex).flags.Angel > 0 Then daño = CInt(daño - (daño * 0.5))
                        If UserList(Userindex).flags.Demonio > 0 Then daño = CInt(daño + (daño * 0.5))

                        'pluto:2.11
                        If UserList(Userindex).GranPoder > 0 Then daño = CInt(daño * 1.4)

                        'pluto:2.16
                        If UserList(tmpIndex).flags.Protec > 0 Then daño = daño - CInt(Porcentaje(daño, UserList( _
                                                                                                        tmpIndex).flags.Protec))

                        'pluto:2.4.1

                        If UserList(tmpIndex).Invent.AnilloEqpObjIndex > 0 Then
                            If ObjData(UserList(tmpIndex).Invent.AnilloEqpObjIndex).SubTipo = 4 Then daño = daño - _
                               CInt(daño / 30)

                        End If

                        'pluto:7.0
                        If UserList(tmpIndex).Invent.ArmourEqpObjIndex > 0 Then
                            daño = daño - ObjData(UserList(tmpIndex).Invent.ArmourEqpObjIndex).Defmagica

                            If daño < 1 Then daño = 1

                        End If

                        Call InfoHechizo(Userindex)
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(UserList( _
                                                                                                      Userindex).flags.TargetUser).Char.CharIndex & "," & Hechizos(H).FXgrh & "," & _
                                                                                                      Hechizos(H).loops)

                        UserList(tmpIndex).Stats.MinHP = UserList(tmpIndex).Stats.MinHP - daño

                        Call SendData(ToIndex, Userindex, 0, "||Le has quitado " & daño & " puntos de vida a " & _
                                                             UserList(MapData(UserList(Userindex).Pos.Map, X, Y).Userindex).Name & "´" & _
                                                             FontTypeNames.FONTTYPE_FIGHT)
                        Call SendData(ToIndex, MapData(UserList(Userindex).Pos.Map, X, Y).Userindex, 0, "||" & _
                                                                                                        UserList(Userindex).Name & " te ha quitado " & daño & " puntos de vida." & "´" & _
                                                                                                        FontTypeNames.FONTTYPE_FIGHT)

                        '[\END]
                        'Muere
                        If UserList(MapData(UserList(Userindex).Pos.Map, X, Y).Userindex).Stats.MinHP < 1 Then
                            Call ContarMuerte(MapData(UserList(Userindex).Pos.Map, X, Y).Userindex, Userindex)
                            UserList(MapData(UserList(Userindex).Pos.Map, X, Y).Userindex).Stats.MinHP = 0
                            Call ActStats(MapData(UserList(Userindex).Pos.Map, X, Y).Userindex, Userindex)

                            'Call UserDie(MapData(UserList(UserIndex).Pos.Map, X, Y).UserIndex)
                        End If

                        b = True
nop:

                    End If

                End If

            Next X
        Next Y

        'cercano usuario zona
    ElseIf Hechizos(H).SubeHP = 3 Then
        'pj area

        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub
        H = UserList(Userindex).Stats.UserHechizos(UserList(Userindex).flags.Hechizo)
        '[MerLiNz:X]
        HH = MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y).Userindex

        '[\END]
        If Userindex = tempChr Then
            Call SendData(ToIndex, Userindex, 0, "L6")
            Exit Sub

        End If

        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

        If Userindex <> tempChr Then
            Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

        End If

        For Y = UserList(Userindex).Pos.Y - 2 To UserList(Userindex).Pos.Y + 2
            For X = UserList(Userindex).Pos.X - 2 To UserList(Userindex).Pos.X + 2

                If X > 0 And Y > 0 And X < 101 And Y < 101 Then
                    If MapData(UserList(Userindex).Pos.Map, X, Y).Userindex > 0 Then
                        If Criminal(Userindex) = Criminal(MapData(UserList(Userindex).Pos.Map, X, Y).Userindex) Then _
                           GoTo nop2
                        tmpIndex = MapData(UserList(Userindex).Pos.Map, X, Y).Userindex

                        If UserList(tmpIndex).flags.Privilegios > 0 Then GoTo nop2

                        'pluto:hoy
                        If UserList(tmpIndex).flags.Muerto > 0 Then GoTo nop

                        If tmpIndex = Userindex Then GoTo nop2
                        daño = RandomNumber(Hechizos(H).MinHP, Hechizos(H).MaxHP)

                        'pluto:7.0 extra monturas subido arriba
                        If UserList(Userindex).flags.Montura = 1 Then
                            oo = UserList(Userindex).flags.ClaseMontura

                            daño = daño - CInt(Porcentaje(daño, UserList(Userindex).Montura.DefMagico(oo))) - 1

                            If daño < 1 Then daño = 1

                        End If

                        '------------fin pluto:2.4-------------------

                        'daño = daño + Porcentaje(daño, 3 * UserList(UserIndex).Stats.ELV)
                        'pluto:6.0----------------------------------------
                        If UserList(Userindex).Remort = 0 Then
                            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
                        Else

                            If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
                                'Dim Topito As Long
                                Topito = UserList(Userindex).Stats.ELV * 3.65

                                If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
                                daño = daño + Porcentaje(daño, Topito)
                            Else
                                daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

                            End If

                        End If

                        '-------------------------------------------------
                        'pluto:2.18
                        daño = daño - CInt(Porcentaje(daño, UserList(tmpIndex).UserDefensaMagiasRaza))

                        'pluto:6.0A Skills
                        'daño = daño + CInt(Porcentaje(daño, (CInt(UserList(UserIndex).Stats.UserSkills(DañoMagia) / 10))))
                        'daño = daño - CInt(Porcentaje(daño, (CInt(UserList(tmpIndex).Stats.UserSkills(DefMagia) / 10))))
                        '----------------------------------------
                        If UserList(tmpIndex).flags.Angel > 0 Then daño = CInt(daño - (daño * 0.5))
                        If UserList(Userindex).flags.Demonio > 0 Then daño = CInt(daño + (daño * 0.5))

                        'pluto:2.11
                        If UserList(Userindex).GranPoder > 0 Then daño = CInt(daño * 1.4)

                        'pluto:2.16
                        If UserList(tmpIndex).flags.Protec > 0 Then daño = daño - CInt(Porcentaje(daño, UserList( _
                                                                                                        tmpIndex).flags.Protec))

                        'pluto:2.4.1

                        If UserList(tmpIndex).Invent.AnilloEqpObjIndex > 0 Then
                            If ObjData(UserList(tmpIndex).Invent.AnilloEqpObjIndex).SubTipo = 4 Then daño = daño - _
                               CInt(daño / 30)

                        End If

                        'pluto:7.0
                        If UserList(tmpIndex).Invent.ArmourEqpObjIndex > 0 Then
                            daño = daño - ObjData(UserList(tmpIndex).Invent.ArmourEqpObjIndex).Defmagica

                            If daño < 1 Then daño = 1

                        End If

                        Call InfoHechizo(Userindex)
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList( _
                                                                                             tmpIndex).Char.CharIndex & "," & Hechizos(H).FXgrh & "," & Hechizos(H).loops)

                        UserList(tmpIndex).Stats.MinHP = UserList(tmpIndex).Stats.MinHP - daño

                        Call SendData(ToIndex, Userindex, 0, "||Le has quitado " & daño & " puntos de vida a " & _
                                                             UserList(tmpIndex).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
                        Call SendData(ToIndex, tmpIndex, 0, "||" & UserList(Userindex).Name & " te ha quitado " & _
                                                            daño & " puntos de vida." & "´" & FontTypeNames.FONTTYPE_FIGHT)

                        'Muere
                        If UserList(tmpIndex).Stats.MinHP < 1 Then
                            Call ContarMuerte(tmpIndex, Userindex)
                            UserList(tmpIndex).Stats.MinHP = 0
                            Call ActStats(tmpIndex, Userindex)

                            'Call UserDie(tmpIndex)
                        End If

                        b = True
nop2:

                    End If

                End If

            Next X
        Next Y

    End If

    'Mana
    If Hechizos(H).SubeMana = 1 Then

        Call InfoHechizo(Userindex)
        Call AddtoVar(UserList(tempChr).Stats.MinMAN, daño, UserList(tempChr).Stats.MaxMAN)

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has restaurado " & daño & " puntos de mana a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha restaurado " & daño & _
                                               " puntos de mana." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has restaurado " & daño & " puntos de mana." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        b = True

    ElseIf Hechizos(H).SubeMana = 2 Then

        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

        If Userindex <> tempChr Then
            Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

        End If

        Call InfoHechizo(Userindex)

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has quitado " & daño & " puntos de mana a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha quitado " & daño & _
                                               " puntos de mana." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has quitado " & daño & " puntos de mana." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        UserList(tempChr).Stats.MinMAN = UserList(tempChr).Stats.MinMAN - daño

        If UserList(tempChr).Stats.MinMAN < 1 Then UserList(tempChr).Stats.MinMAN = 0
        b = True

    End If

    'Stamina
    If Hechizos(H).SubeSta = 1 Then
        Call InfoHechizo(Userindex)
        Call AddtoVar(UserList(tempChr).Stats.MinSta, daño, UserList(tempChr).Stats.MaxSta)

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has restaurado " & daño & " puntos de vitalidad a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha restaurado " & daño & _
                                               " puntos de vitalidad." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has restaurado " & daño & " puntos de vitalidad." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        b = True
    ElseIf Hechizos(H).SubeMana = 2 Then

        If Not PuedeAtacar(Userindex, tempChr) Then Exit Sub

        If Userindex <> tempChr Then
            Call UsuarioAtacadoPorUsuario(Userindex, tempChr)

        End If

        Call InfoHechizo(Userindex)

        If Userindex <> tempChr Then
            Call SendData(ToIndex, Userindex, 0, "||Le has quitado " & daño & " puntos de vitalidad a " & UserList( _
                                                 tempChr).Name & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, tempChr, 0, "||" & UserList(Userindex).Name & " te ha quitado " & daño & _
                                               " puntos de vitalidad." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, Userindex, 0, "||Te has quitado " & daño & " puntos de vitalidad." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        UserList(tempChr).Stats.MinSta = UserList(tempChr).Stats.MinSta - daño

        If UserList(tempChr).Stats.MinSta < 1 Then UserList(tempChr).Stats.MinSta = 0
        b = True

    End If


    'Habilidades Pirata
    If Hechizos(H).Nombre = "¡Al Abordaje!" Then

    End If

    Exit Sub
fallo:
    Call LogError("hechizopropiousuario " & Err.number & " D: " & Err.Description)

End Sub

Sub UpdateUserHechizos(ByVal UpdateAll As Boolean, _
                       ByVal Userindex As Integer, _
                       ByVal Slot As Byte)

    On Error GoTo fallo

    'Call LogTarea("Sub UpdateUserHechizos")

    Dim loopc As Byte

    'Actualiza un solo slot
    If Not UpdateAll Then

        'Actualiza el inventario
        If UserList(Userindex).Stats.UserHechizos(Slot) > 0 Then
            Call ChangeUserHechizo(Userindex, Slot, UserList(Userindex).Stats.UserHechizos(Slot))
        Else
            Call ChangeUserHechizo(Userindex, Slot, 0)

        End If

    Else

        'Actualiza todos los slots
        For loopc = 1 To MAXUSERHECHIZOS

            'Actualiza el inventario
            If UserList(Userindex).Stats.UserHechizos(loopc) > 0 Then
                Call ChangeUserHechizo(Userindex, loopc, UserList(Userindex).Stats.UserHechizos(loopc))
            Else
                Call ChangeUserHechizo(Userindex, loopc, 0)

            End If

        Next loopc

    End If

    Exit Sub
fallo:
    Call LogError("updateuserhechizos " & Err.number & " D: " & Err.Description)

End Sub

Sub ChangeUserHechizo(ByVal Userindex As Integer, _
                      ByVal Slot As Byte, _
                      ByVal Hechizo As Integer)

    On Error GoTo fallo

    UserList(Userindex).Stats.UserHechizos(Slot) = Hechizo

    If Hechizo > 0 And Hechizo < NumeroHechizos + 1 Then
        Call SendData2(ToIndex, Userindex, 0, 34, Slot & "," & Hechizo)
    Else
        Call SendData2(ToIndex, Userindex, 0, 34, Slot & "," & "0")

    End If

    Exit Sub
fallo:
    Call LogError("changeuserhechizo " & Err.number & " D: " & Err.Description)

End Sub

Sub HabilidadesPirata(ByVal Userindex As Integer, ByVal Hechizo As Integer)

End Sub
