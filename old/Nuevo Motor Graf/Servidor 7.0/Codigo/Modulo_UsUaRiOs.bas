Attribute VB_Name = "UsUaRiOs"
Option Explicit

Public Sub BorrarUsuario(ByVal UserName As String)

'on error Resume Next
'If FileExist(CharPath & UCase$(UserName) & ".chr", vbNormal) Then
'    Kill CharPath & UCase$(UserName) & ".chr"
'End If
End Sub

Sub ActStats(ByVal VictimIndex As Integer, ByVal AttackerIndex As Integer)

    On Error GoTo fallo

    Dim DaExp As Long

    'Juegos del Hambre Automatico
    If UserList(VictimIndex).flags.HungerGames = True And UserList(VictimIndex).Pos.Map = 34 Then
        Call SendData(ToIndex, VictimIndex, 0, "|/Juegos del Hambre" & "> " & _
                                               "Fuiste asesinado ¡Suerte la próxima vez!")
        Call SendData(ToMap, 0, 34, "|/Juegos del Hambre" & "> ¡" & UserList(VictimIndex).Name & _
                                    " fue eliminado por " & UserList(AttackerIndex).Name & "!")
        UserList(VictimIndex).flags.HungerGames = False
        Call TirarTodosLosItemsNoNewbies(VictimIndex)
        Call WarpUserChar(VictimIndex, 34, 50, 50, True)
        Call HungerGames_Muere(VictimIndex)

    End If

    'Juegos del Hambre Automatico

    '------------------------------------------------
    
    If UserList(VictimIndex).Faccion.ArmadaReal = 1 And UserList(AttackerIndex).Faccion.SoyReal = 1 And UserList(AttackerIndex).Faccion.Castigo > 0 Then
        If MapInfo(UserList( _
        AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> _
        "CLANATACA" And UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> _
        mapa_castillo2 And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map _
        <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 And (UserList(AttackerIndex).Pos.Map < 268 _
        Or UserList(AttackerIndex).Pos.Map > 271) And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "EVENTO" _
        And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 Then
    
    
            Call SendData(ToIndex, AttackerIndex, 0, _
                    "||Mataste un usuario de tu facción, pierdes 25.000 monedas de oro" & "´" & _
                    FontTypeNames.FONTTYPE_WARNING)
            UserList(AttackerIndex).Stats.GLD = UserList(AttackerIndex).Stats.GLD - 25000
            
            Call SendUserStatsOro(AttackerIndex)
                      
        End If
    End If
    
    If UserList(VictimIndex).Faccion.FuerzasCaos = 1 And UserList(AttackerIndex).Faccion.SoyCaos = 1 And UserList(AttackerIndex).Faccion.Castigo > 0 Then
        If MapInfo(UserList( _
        AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> _
        "CLANATACA" And UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> _
        mapa_castillo2 And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map _
        <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 And (UserList(AttackerIndex).Pos.Map < 268 _
        Or UserList(AttackerIndex).Pos.Map > 271) And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "EVENTO" _
        And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 Then
    
    
            Call SendData(ToIndex, AttackerIndex, 0, _
                    "||Mataste un usuario de tu facción, pierdes 25.000 monedas de oro" & "´" & _
                    FontTypeNames.FONTTYPE_WARNING)
            UserList(AttackerIndex).Stats.GLD = UserList(AttackerIndex).Stats.GLD - 25000
            
            Call SendUserStatsOro(AttackerIndex)
                                     
        End If
    End If
    
    'PLUTO:2.4.1
    Dim aa As Integer
    aa = RandomNumber(1, 30)
    DaExp = CInt((UserList(VictimIndex).Stats.ELV * 2) + aa)
    'pluto:6.2
    'If UserList(VictimIndex).Name = "Jaba" Then DaExp = 1000000

    Call AddtoVar(UserList(AttackerIndex).Stats.exp, DaExp, MAXEXP)

    'Lo mata
    Call SendData(ToIndex, AttackerIndex, 0, "||Has matado " & UserList(VictimIndex).Name & "!" & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
    Call SendData(ToIndex, AttackerIndex, 0, "||Has ganado " & DaExp & " puntos de experiencia." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)

    Call SendData(ToIndex, VictimIndex, 0, "||" & UserList(AttackerIndex).Name & " te ha matado!" & "´" & _
                                           FontTypeNames.FONTTYPE_FIGHT)

    'pluto:2.6.0 añade fortaleza
    'pluto:6.8 añade torneo2 y ciudades y salas clan
    If MapInfo(UserList(AttackerIndex).Pos.Map).Pk = True And UserList(AttackerIndex).Pos.Map <> 185 And MapInfo( _
       UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno _
       <> "CASTILLO" And MapInfo(UserList(AttackerIndex).Pos.Map).Zona <> "CLAN" And MapInfo(UserList(AttackerIndex).Pos.Map).Zona <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Zona <> "EVENTO" _
       And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 Then

        If Not Criminal(VictimIndex) Then
            'Call AddtoVar(UserList(AttackerIndex).Reputacion.AsesinoRep, vlASESINO * 2, MAXREP)
            'UserList(AttackerIndex).Reputacion.BurguesRep = 0
            'UserList(AttackerIndex).Reputacion.NobleRep = 0
            'UserList(AttackerIndex).Reputacion.PlebeRep = 0
        Else
            'Call AddtoVar(UserList(AttackerIndex).Reputacion.NobleRep, vlNoble, MAXREP)

        End If

    End If

    If UserList(AttackerIndex).MuertesTime > 6 Then
        'pluto:2.10
        Call SendData(ToAdmins, AttackerIndex, 0, "|| Posible Puente de Armadas en " & UserList(AttackerIndex).Name & _
                                                  " Mata a " & UserList(VictimIndex).Name & " --> " & UserList(AttackerIndex).MuertesTime & _
                                                  " Muertes/Minuto" & "´" & FontTypeNames.FONTTYPE_talk)

    End If

    Call UserDie(VictimIndex)

    Call AddtoVar(UserList(AttackerIndex).Stats.UsuariosMatados, 1, 31000)

    'Log
    Call LogAsesinato(UserList(AttackerIndex).Name & " asesino a " & UserList(VictimIndex).Name)
    Exit Sub
fallo:
    Call LogError("accstats " & Err.number & " D: " & Err.Description)

End Sub

Sub RevivirUsuario(ByVal Userindex As Integer)

    On Error GoTo fallo

    'pluto:6.2-------------- aca tenes q fijarte para el tema del resumata
    With UserList(Userindex)
        .flags.Incor = True
        .Counters.Incor = 0
        '-----------------------
        .flags.Muerto = 0
        .Stats.MinHP = 10

        Call DarCuerpoDesnudo(Userindex)
        '[GAU] Agregamo .Char.Botas
        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .OrigChar.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
        Call SendUserStatsVida(Userindex)

    End With

    Exit Sub
fallo:
    Call LogError("revivirusuario " & Err.number & " D: " & Err.Description)

End Sub

Sub RevivirUsuarioangel(ByVal Userindex As Integer)

    On Error GoTo fallo

    'pluto:3-2-04
    If Criminal(Userindex) Then Exit Sub

    With UserList(Userindex)

        'pluto:6.0A
        If .flags.Navegando > 0 Then Exit Sub
        .flags.Muerto = 0
        .Stats.MinHP = .Stats.MaxHP
        Call SendData(ToIndex, Userindex, 0, "||¡PODER DIVINO has ganado 500 puntos de nobleza!." & "´" & FontTypeNames.FONTTYPE_INFO)

        Call DarCuerpoDesnudo(Userindex)
        '[GAU] Agregamo .Char.Botas
        Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .OrigChar.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
        Call SendUserStatsVida(Userindex)

    End With

    Exit Sub
fallo:
    Call LogError("revivirusuarioangel " & Err.number & " D: " & Err.Description)

End Sub

'[GAU] Agregamo botas
'[GAU] Agregamo botas
Sub ChangeUserChar(ByVal sndRoute As Byte, _
                   ByVal sndIndex As Integer, _
                   ByVal sndMap As Integer, _
                   ByVal Userindex As Integer, _
                   ByVal Body As Integer, _
                   ByVal Head As Integer, _
                   ByVal Heading As Byte, _
                   ByVal Arma As Integer, _
                   ByVal escudo As Integer, _
                   ByVal casco As Integer, _
                   ByVal Botas As Integer, _
                   ByVal Alas As Integer)

    On Error GoTo fallo

    With UserList(Userindex).Char
        .Botas = Botas
        .AlasAnim = Alas
        .Body = Body
        .Head = Head
        .Heading = Heading
        .WeaponAnim = Arma
        .ShieldAnim = escudo
        .CascoAnim = casco
        Call SendData(sndRoute, sndIndex, sndMap, "CP" & .CharIndex & "," & Body & "," & Head & "," & Heading & "," & Arma & "," & escudo & "," & 0 & "," & 0 & "," & casco & "," & Botas & "," & Alas)

    End With

    Exit Sub
fallo:
    Call LogError("changeuserchar " & Err.number & " D: " & Err.Description)

End Sub

Sub EnviarSubirNivel(ByVal Userindex As Integer, ByVal Puntos As Integer)

    On Error GoTo fallo

    Call SendData2(ToIndex, Userindex, 0, 48, Puntos)
    Exit Sub
fallo:
    Call LogError("enviarsubirnivel " & Err.number & " D: " & Err.Description)

End Sub

Sub EnviaUnSkills(ByVal Userindex As Integer, ByVal Skill As Integer)

    On Error GoTo fallo

    Call SendData(ToIndex, Userindex, 0, "J1" & UserList(Userindex).Stats.UserSkills(Skill) & "," & Skill)

    Exit Sub
fallo:
    Call LogError("enviaUnskills " & Err.number & " D: " & Err.Description)

End Sub

Sub EnviarSkills(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim i As Integer
    Dim cad$

    For i = 1 To NUMSKILLS
        cad$ = cad$ & UserList(Userindex).Stats.UserSkills(i) & ","
    Next
    cad$ = cad$ + str$(UserList(Userindex).Stats.SkillPts)
    SendData2 ToIndex, Userindex, 0, 57, cad$

    Exit Sub
fallo:
    Call LogError("enviarsubirskills " & Err.number & " D: " & Err.Description)

End Sub

Sub EnviarFama(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim cad$
    cad$ = cad$ & UserList(Userindex).Reputacion.AsesinoRep & ","
    cad$ = cad$ & UserList(Userindex).Reputacion.BandidoRep & ","
    cad$ = cad$ & UserList(Userindex).Reputacion.BurguesRep & ","
    cad$ = cad$ & UserList(Userindex).Reputacion.LadronesRep & ","
    cad$ = cad$ & UserList(Userindex).Reputacion.NobleRep & ","
    cad$ = cad$ & UserList(Userindex).Reputacion.PlebeRep & ","

    Dim l As Long
    l = (-UserList(Userindex).Reputacion.AsesinoRep) + (-UserList(Userindex).Reputacion.BandidoRep) + UserList( _
        Userindex).Reputacion.BurguesRep + (-UserList(Userindex).Reputacion.LadronesRep) + UserList( _
        Userindex).Reputacion.NobleRep + UserList(Userindex).Reputacion.PlebeRep
    l = l / 6

    UserList(Userindex).Reputacion.Promedio = l

    cad$ = cad$ & UserList(Userindex).Reputacion.Promedio & ","
    'cad$ = cad$ & UserList(UserIndex).clase
    SendData2 ToIndex, Userindex, 0, 47, cad$
    Exit Sub
fallo:
    Call LogError("enviarfama " & Err.number & " D: " & Err.Description)

End Sub

Sub EnviarAtrib(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim i As Integer
    Dim cad$

    For i = 1 To NUMATRIBUTOS
        cad$ = cad$ & UserList(Userindex).Stats.UserAtributos(i) & ","
    Next
    Call SendData2(ToIndex, Userindex, 0, 36, cad$)
    Exit Sub
fallo:
    Call LogError("enviaratrib " & Err.number & " D: " & Err.Description)

End Sub

Sub EraseUserChar(sndRoute As Byte, _
                  sndIndex As Integer, _
                  sndMap As Integer, _
                  Userindex As Integer)

    On Error GoTo ErrorHandler

    'pluto:6.5
    If UserList(Userindex).Char.CharIndex = 0 Then Exit Sub

    'Debug.Print (UserList(UserIndex).Name)
    'Exit Sub
    ' End If

    CharList(UserList(Userindex).Char.CharIndex) = 0

    If UserList(Userindex).Char.CharIndex = LastChar Then

        Do Until CharList(LastChar) > 0
            LastChar = LastChar - 1

            If LastChar = 0 Then Exit Do
        Loop

    End If

    MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y).Userindex = 0

    'Le mandamos el mensaje para que borre el personaje a los clientes que este en el mismo mapa
    Call SendData(ToMap, Userindex, UserList(Userindex).Pos.Map, "BP" & UserList(Userindex).Char.CharIndex)

    UserList(Userindex).Char.CharIndex = 0

    ' NumChars = NumChars - 1

    Exit Sub

ErrorHandler:
    Call LogError("Error en EraseUserchar")

End Sub

Sub EraseUserCharMismoIndex(ByVal Userindex As Integer)

    On Error GoTo ErrorHandler

    Dim Fallito As Byte

    'pluto:6.5
    If UserList(Userindex).Char.CharIndex = 0 Then Exit Sub
    Fallito = 1
    'Debug.Print (UserList(UserIndex).Name)
    'Exit Sub
    ' End If

    'CharList(UserList(UserIndex).Char.CharIndex) = 0

    'If UserList(UserIndex).Char.CharIndex = LastChar Then
    '   Do Until CharList(LastChar) > 0
    '      LastChar = LastChar - 1
    '     If LastChar = 0 Then Exit Do
    'Loop
    '   End If

    MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y).Userindex = 0
    Fallito = 2
    'Le mandamos el mensaje para que borre el personaje a los clientes que este en el mismo mapa
    Call SendData(ToMap, Userindex, UserList(Userindex).Pos.Map, "BP" & UserList(Userindex).Char.CharIndex)
    Fallito = 3
    'UserList(UserIndex).Char.CharIndex = 0

    'NumChars = NumChars - 1
    Fallito = 4
    Exit Sub

ErrorHandler:
    Call LogError("Error en EraseUsercharMismoIndex Name: " & UserList(Userindex).Name & "Pos: " & UserList( _
                  Userindex).Pos.Map & " X: " & UserList(Userindex).Pos.X & " Y: " & UserList(Userindex).Pos.Y & " F: " & _
                  Fallito & " Charindex: " & UserList(Userindex).Char.CharIndex & " " & Err.Description)

End Sub

Sub MakeUserChar(sndRoute As Byte, _
                 sndIndex As Integer, _
                 sndMap As Integer, _
                 Userindex As Integer, _
                 ByVal Map As Integer, _
                 ByVal X As Integer, _
                 ByVal Y As Integer)

    On Error GoTo fallo

    Dim CharIndex As Integer

    If InMapBounds(Map, X, Y) Then

        With UserList(Userindex)

            'If needed make a new character in list
            If .Char.CharIndex = 0 Then
                CharIndex = NextOpenCharIndex
                .Char.CharIndex = CharIndex
                CharList(CharIndex) = Userindex

            End If

            'Place character on map
            MapData(Map, X, Y).Userindex = Userindex

            'Send make character command to clients
            Dim klan As String
            klan = .GuildInfo.GuildName
            Dim bCr As Byte

            If (Criminal(Userindex)) Then bCr = 1
   
            Dim EsGoblin As Byte

            Dim rReal    As Byte

            If .Faccion.ArmadaReal = 1 Then

                If .raza = "Goblin" Then EsGoblin = 1 Else EsGoblin = 0
                rReal = 1
                Call SendData(sndRoute, sndIndex, sndMap, "CC" & .Char.Body & "," & .Char.Head & "," & .Char.Heading & "," & .Char.CharIndex & "," & X & "," & Y & "," & .Char.WeaponAnim & "," & .Char.ShieldAnim & "," & .Char.FX & "," & klan & "," & .Char.CascoAnim & "," & .Name & "," & bCr & "," & .flags.Privilegios & "," & .Char.Botas & "," & .flags.partyNum & "," & .flags.DragCredito4 & "," & EsGoblin & "," & rReal & "," & .Char.AlasAnim & "," & .flags.LiderAlianza & "," & .flags.LiderHorda & "," & .flags.Revisar)
                                             
            ElseIf .Faccion.FuerzasCaos = 1 Then

                If .raza = "Goblin" Then EsGoblin = 1 Else EsGoblin = 0
                rReal = 2
                Call SendData(sndRoute, sndIndex, sndMap, "CC" & .Char.Body & "," & .Char.Head & "," & .Char.Heading & "," & .Char.CharIndex & "," & X & "," & Y & "," & .Char.WeaponAnim & "," & .Char.ShieldAnim & "," & .Char.FX & "," & klan & "," & .Char.CascoAnim & "," & .Name & "," & bCr & "," & .flags.Privilegios & "," & .Char.Botas & "," & .flags.partyNum & "," & .flags.DragCredito4 & "," & EsGoblin & "," & rReal & "," & .Char.AlasAnim & "," & .flags.LiderAlianza & "," & .flags.LiderHorda & "," & .flags.Revisar)
       
            Else

                If .raza = "Goblin" Then EsGoblin = 1 Else EsGoblin = 0
                rReal = 0
                Call SendData(sndRoute, sndIndex, sndMap, "CC" & .Char.Body & "," & .Char.Head & "," & .Char.Heading & "," & .Char.CharIndex & "," & X & "," & Y & "," & .Char.WeaponAnim & "," & .Char.ShieldAnim & "," & .Char.FX & "," & klan & "," & .Char.CascoAnim & "," & .Name & "," & bCr & "," & .flags.Privilegios & "," & .Char.Botas & "," & .flags.partyNum & "," & .flags.DragCredito4 & "," & EsGoblin & "," & rReal & "," & .Char.AlasAnim & "," & .flags.LiderAlianza & "," & .flags.LiderHorda & "," & .flags.Revisar)

            End If

        End With

    End If

    Exit Sub
fallo:
    Call LogError("makeuserchar " & Err.number & " D: " & Err.Description)

End Sub

Sub CheckUserLevel(ByVal Userindex As Integer)

    On Error GoTo errhandler

    Dim Pts         As Integer
    Dim AumentoHIT  As Integer
    Dim AumentoST   As Integer
    Dim AumentoMANA As Integer
    Dim AumentoHP   As Integer
    Dim WasNewbie   As Boolean
    
    Call SendUserStatsEXP(Userindex)

    '¿Alcanzo el maximo nivel?
    With UserList(Userindex)

        If .Stats.ELV = 55 Then
        .Stats.exp = 0
        .Stats.Elu = 999999
        Exit Sub
        End If

        If .Stats.ELV = STAT_MAXELV Then    '1
            .Stats.exp = 0
            .Stats.Elu = 0
            Exit Sub

        End If    '1

        WasNewbie = EsNewbie(Userindex)

        'Si exp >= then Exp para subir de nivel entonce subimos el nivel
        If .Stats.exp >= .Stats.Elu Then    '2

            Call SendData(ToPCArea, Userindex, .Pos.Map, "TW" & SOUND_NIVEL)
            Call SendData(ToIndex, Userindex, 0, "||¡Has subido de nivel!" & "´" & FontTypeNames.FONTTYPE_INFO)
            'nati: agrego MensajesQuest!
            'Call MensajesQuest(UserIndex)

            'pluto:2.15--------SUBE LEVEL NIÑO---------------
            If .Bebe > 0 Then    '3
                .Stats.ELV = .Stats.ELV + 1
                .Stats.exp = 0
                .Stats.Elu = .Stats.Elu * 2.5
                AumentoHP = RandomNumber(2, .Stats.UserAtributos(Constitucion) / 2) + Int(.Bebe / 3)
                AumentoST = Int(.Bebe / 2)
                AumentoHIT = Int(.Bebe / 3)

                Call AddtoVar(.Stats.MaxHP, AumentoHP, STAT_MAXHP)
                Call AddtoVar(.Stats.MaxSta, AumentoST, STAT_MAXSTA)
                Call AddtoVar(.Stats.MaxHIT, AumentoHIT, STAT_MAXHIT)
                Call AddtoVar(.Stats.MinHIT, AumentoHIT, STAT_MAXHIT)
                Call SendData(ToIndex, Userindex, 0, "||Mejora de tus Atributos: " & "´" & FontTypeNames.FONTTYPE_INFO)
                Dim Incre As Byte
                Dim probi As Byte
                Dim n     As Byte

                For n = 1 To 5
                    probi = RandomNumber(1, 30) + .Bebe
                    Incre = 0

                    If probi > 6 Then Incre = 1

                    If probi > 22 Then Incre = RandomNumber(1, CInt(.Bebe / 5))

                    If probi > 30 Then Incre = 2
                    .Stats.UserAtributosBackUP(n) = .Stats.UserAtributosBackUP(n) + Incre
                    .Stats.UserAtributos(n) = .Stats.UserAtributosBackUP(n)

                    If n = 1 Then Call SendData(ToIndex, Userindex, 0, "||Fuerza: " & Incre & "´" & FontTypeNames.FONTTYPE_INFO)

                    If n = 2 Then Call SendData(ToIndex, Userindex, 0, "||Agilidad: " & Incre & "´" & FontTypeNames.FONTTYPE_INFO)

                    If n = 3 Then Call SendData(ToIndex, Userindex, 0, "||Inteligencia: " & Incre & "´" & FontTypeNames.FONTTYPE_INFO)

                    If n = 4 Then Call SendData(ToIndex, Userindex, 0, "||Carisma: " & Incre & "´" & FontTypeNames.FONTTYPE_INFO)

                    If n = 5 Then Call SendData(ToIndex, Userindex, 0, "||Constitución: " & Incre & "´" & FontTypeNames.FONTTYPE_INFO)

                Next
                .Stats.SkillPts = .Stats.SkillPts + (.Bebe * 2)
                Call SendData(ToIndex, Userindex, 0, "||Has ganado " & .Bebe * 2 & " SkillPoints." & "´" & FontTypeNames.FONTTYPE_INFO)
                'pluto:6.0A
                .Stats.Fama = .Stats.Fama + 25

                '------------deja de ser niño-----------------
                If .Stats.ELV >= 5 Then    '4

                    Call DarCuerpoYCabeza(.Char.Body, .Char.Head, .raza, .Genero)
                    .OrigChar = .Char
                    .Char.WeaponAnim = NingunArma
                    .Char.ShieldAnim = NingunEscudo
                    .Char.CascoAnim = NingunCasco
                    .Stats.MET = 1
                    .Stats.FIT = 1
                    'clase aleatoria
                    Dim Oiu       As Byte
                    Dim UserClase As String
                    Oiu = RandomNumber(1, 18)
                    .clase = ListaClases(Oiu)
                    UserClase = .clase
                    'pluto:2.15
                    Dim ains As Integer

                    If UserClase = "Mago" Or UserClase = "Clerigo" Or UserClase = "Druida" Or UserClase = "Bardo" Or UserClase = "Pirata" Or UserClase = "Asesino" Then    '5
                        ains = 18

                        If .Stats.UserAtributosBackUP(Inteligencia) < ains Then
                            .Stats.UserAtributosBackUP(Inteligencia) = ains
                            .Stats.UserAtributos(Inteligencia) = .Stats.UserAtributosBackUP(Inteligencia)

                        End If

                    End If    'clase mago or cler.... '5

                    If UserClase = "Guerrero" Or UserClase = "Cazador" Or UserClase = "Arquero" Or UserClase = "Paladin" Then    '6
                        ains = 18


                        If .Stats.UserAtributosBackUP(Constitucion) < ains Then
                            .Stats.UserAtributosBackUP(Constitucion) = ains
                            .Stats.UserAtributos(Constitucion) = .Stats.UserAtributosBackUP(Constitucion)

                        End If

                    End If    'clase guerrero... '6

                    If UserClase = "Ladron" Or UserClase = "Bandido" Then    '7
                        ains = 18


                        If .Stats.UserAtributosBackUP(Agilidad) < ains Then
                            .Stats.UserAtributosBackUP(Agilidad) = ains
                            .Stats.UserAtributos(Agilidad) = .Stats.UserAtributosBackUP(Agilidad)

                        End If

                    End If    'clase ladron '7

                    '---------------
                    'Mana
                    Dim MiInt As Byte

                    If UserClase = "Mago" Then    '8
                        MiInt = RandomNumber(1, .Stats.UserAtributos(Inteligencia)) / 3
                        .Stats.MaxMAN = 100 + MiInt
                        .Stats.MinMAN = 100 + MiInt
                    ElseIf UserClase = "Clerigo" Or UserClase = "Druida" Or UserClase = "Bardo" Or UserClase = "Pirata" Or UserClase = "Asesino" Then
                        MiInt = RandomNumber(1, .Stats.UserAtributos(Inteligencia)) / 4
                        .Stats.MaxMAN = 50
                        .Stats.MinMAN = 50
                    Else
                        .Stats.MaxMAN = 0
                        .Stats.MinMAN = 0

                    End If    '8

                    If UserClase = "Mago" Or UserClase = "Clerigo" Or UserClase = "Druida" Or UserClase = "Bardo" Or UserClase = "Pirata" Or UserClase = "Asesino" Then    '9
                        .Stats.UserHechizos(1) = 2

                    End If    '9

                    .Stats.exp = 0
                    .Stats.Elu = 200
                    .Stats.ELV = 0
                    .Bebe = 0
                    Call SendData(ToIndex, Userindex, 0, "!! Ya eres adulto y has decidido que tu futuro es llegar a ser el mejor " & UserClase & " de estas tierras.")
                              
                    Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)

                    '----------fin deja ser niño---------------
                Else
                    GoTo yap

                End If    '4

                'GoTo yap
            End If    '3

            '-----------------------------------------------

            ' If .Stats.ELV = 1 Then
            'Pts = 10

            'Else
            Pts = 5
            'End If

            'pluto:2.17
            If .clase = "Minero" Or .clase = "Leñador" Or .clase = "Pescador" Or .clase = "Herrero" Or .clase = "Ermitaño" Or .clase = "Carpintero" Or .clase = "Domador" Then Pts = Pts * 2

            If .Remort > 0 Then Pts = Pts + 1
            '-------------------------------
            .Stats.SkillPts = .Stats.SkillPts + Pts

            Call SendData(ToIndex, Userindex, 0, "||Has ganado " & Pts & " skillpoints." & "´" & FontTypeNames.FONTTYPE_INFO)
            'pluto:6.0A
            .Stats.Fama = .Stats.Fama + 25

            .Stats.ELV = .Stats.ELV + 1

            .Stats.exp = 0

            'Iron AO: Avisa que llegaste a Nivel 55
            If .Stats.ELV = 55 Then    'cambiar por su nivel máximo
                Call SendData(ToAll, 0, 0, "||" & .Name & " Llegó al nivel 55, felicitaciones!!" & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            'sacar del newbie
            If Not EsNewbie(Userindex) And WasNewbie Then

                If .Pos.Map = 37 Then Call WarpUserChar(Userindex, Nix.Map, Nix.X, Nix.Y, True)
                Call WarpUserChar(Userindex, 34, 34, 37, True)
                'Call SendData(ToIndex, Userindex, 0, _
                 "!! Has dejado de ser Newbie y ya no estás protegido por los Dioses. Todos los objetos de Newbie serán borrados de tu inventario y a partir de ahora todos los objetos que consigas se te caerán al morir (incluido el oro). Suerte!! ")
                'Call SendData(ToIndex, Userindex, 0, "||Es Hora de elegir una facción, has dejado de ser Newbie, si quieres hacerlo mas adelante selecciona la opción NEUTRAL." & "´" & FontTypeNames.FONTTYPE_INFO)
                'Call SendData(ToIndex, Userindex, 0, "D2")

            End If

            'pluto:6.5--
            'End If
            '-------------
            If Not EsNewbie(Userindex) And WasNewbie Then
                Call QuitarNewbieObj(Userindex)
                Call MigracionOro(Userindex)

            End If

            If .Stats.ELV < 11 Then
                .Stats.Elu = Round(.Stats.Elu * 1.5)
            ElseIf .Stats.ELV < 40 Then
                .Stats.Elu = Round(.Stats.Elu * 1.3)
            Else
                .Stats.Elu = Round(.Stats.Elu * 1.45)

            End If

            'pluto:6.5
            Dim Elixir As Byte
            Elixir = .flags.Elixir
            'pluto:6.9
            Dim ManaEquipado As Integer
            ManaEquipado = ObjetosConMana(Userindex)
            '------------------------

            'nati: nuevo diseño de subida de vida.
            Select Case .clase

                Case "Guerrero"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 12)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 12)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 13) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 13)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(10, 13) + Elixir
                        Else
                            AumentoHP = RandomNumber(10, 13)

                        End If
                        
                    End If

                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(11, 13) + Elixir
                        Else
                            AumentoHP = RandomNumber(11, 13)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(11, 14) + Elixir
                        Else
                            AumentoHP = RandomNumber(11, 14)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(12, 14) + Elixir
                        Else
                            AumentoHP = RandomNumber(12, 14)

                        End If
                    
                    End If
                    

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 1
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 1
                    'End If
                    '-------------------------------------

                    AumentoST = 15
                    AumentoHIT = 3
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWnomagico" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                       ' If Elixir = 10 Then
                        '    AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 4
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 4

                        'End If

                        '----------------------------------------------------

                        AumentoHIT = 4
                        AumentoST = 25
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 999)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1500)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 200)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 200)
                        GoTo yap

                    End If

                    '¿?¿?¿?¿?¿?¿?¿ HitPoints ¿?¿?¿?¿?¿?¿?¿
                    Call AddtoVar(.Stats.MaxHP, AumentoHP, STAT_MAXHP)

                    'EZE AGREGAR max vida
                    If .Stats.MaxHP >= 999 Then

                        .Stats.MaxHP = 999

                    End If

                    '¿?¿?¿?¿?¿?¿?¿ Stamina ¿?¿?¿?¿?¿?¿?¿
                    Call AddtoVar(.Stats.MaxSta, AumentoST, STAT_MAXSTA)

                    '¿?¿?¿?¿?¿?¿?¿ Golpe ¿?¿?¿?¿?¿?¿?¿
                    Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 120)
                    Call AddtoVar(.Stats.MinHIT, AumentoHIT, 120)

                Case "Cazador"

                    'pluto:6.5-----------------------------
                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 11)

                        End If

                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 12)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(10, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(10, 12)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(10, 13) + Elixir
                        Else
                            AumentoHP = RandomNumber(10, 13)

                        End If
                    
                    End If

                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero
                    'End If
                    '------------------------------------

                    AumentoST = 15
                    AumentoHIT = 3
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWnomagico" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                        'If Elixir = 10 Then
                         '   AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 2
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 2

                        'End If

                        '----------------------------------------------------

                        AumentoST = 25
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 999)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1500)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 120)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 120)
                        GoTo yap

                    End If

                    '¿?¿?¿?¿?¿?¿?¿ HitPoints ¿?¿?¿?¿?¿?¿?¿
                    Call AddtoVar(.Stats.MaxHP, AumentoHP, STAT_MAXHP)

                    'EZE AGREGAR max vida del Cazador
                    If .Stats.MaxHP >= 999 Then

                        .Stats.MaxHP = 999

                    End If

                    '¿?¿?¿?¿?¿?¿?¿ Stamina ¿?¿?¿?¿?¿?¿?¿
                    Call AddtoVar(.Stats.MaxSta, AumentoST, STAT_MAXSTA)

                    '¿?¿?¿?¿?¿?¿?¿ Golpe ¿?¿?¿?¿?¿?¿?¿
                    Call AddtoVar(.Stats.MaxHIT, AumentoHIT, STAT_MAXHIT)
                    Call AddtoVar(.Stats.MinHIT, AumentoHIT, STAT_MAXHIT)

                    'pluto:2.17

                Case "Arquero"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(3, 7) + Elixir
                        Else
                            AumentoHP = RandomNumber(3, 7)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(4, 7) + Elixir
                        Else
                            AumentoHP = RandomNumber(4, 7)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(4, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(4, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 10)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If
                    
                    End If

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = .Stats.UserAtributos(Constitucion) \ 2
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2)
                    'End If
                    '---------------------------------------------

                    AumentoST = 15
                    AumentoHIT = 2
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWnomagico" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                       ' If Elixir = 10 Then
                        '    AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 1
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 1

                        'End If

                        '-------------------------------------------------------

                        'pluto:6.0A------------------
                        If .Stats.ELV Mod (2) = 0 Then
                            AumentoHIT = 3
                        Else
                            AumentoHIT = 3

                        End If

                        '-------------------------
                        AumentoST = 20
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 999)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1500)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 130)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 130)
                        GoTo yap

                    End If

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP

                    'EZE AGREGAR max vida del Arquero
                    If .Stats.MaxHP >= 999 Then

                        .Stats.MaxHP = 999

                    End If

                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA

                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Pirata"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 12)

                        End If

                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 12)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(10, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(10, 12)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(10, 13) + Elixir
                        Else
                            AumentoHP = RandomNumber(10, 13)

                        End If
                    
                    End If

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero
                    'End If
                    '-------------------------------------------------

                    AumentoST = 15
                    AumentoHIT = 3
                    AumentoMANA = .Stats.UserAtributos(Inteligencia)
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWsemi" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                        'If Elixir = 10 Then
                         '   AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 1
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 1

                        'End If

                        '---------------------------------------

                        AumentoST = 20
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 999)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1300)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 170)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 170)
                        Call AddtoVar(.Stats.MaxMAN, AumentoMANA, 9999 + ManaEquipado)
                        GoTo yap

                    End If

                    'If CInt(.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 1)) > STAT_MAXMAN Then AumentoMANA = 0

                    'HP
                    Call AddtoVar(.Stats.MaxHP, AumentoHP, STAT_MAXHP)

                    'EZE AGREGAR max vida del Pirata
                    If .Stats.MaxHP >= 999 Then

                        .Stats.MaxHP = 999

                    End If

                    'Mana
                    If CInt((.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 2)) + 0) < STAT_MAXMAN Then AddtoVar .Stats.MaxMAN, AumentoMANA, 9999 + ManaEquipado

                    'STA
                    Call AddtoVar(.Stats.MaxSta, AumentoST, STAT_MAXSTA)

                    'Golpe
                    Call AddtoVar(.Stats.MaxHIT, AumentoHIT, STAT_MAXHIT)
                    Call AddtoVar(.Stats.MinHIT, AumentoHIT, STAT_MAXHIT)

                Case "Paladin"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 12)

                        End If

                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 12)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(10, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(10, 12)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(10, 13) + Elixir
                        Else
                            AumentoHP = RandomNumber(10, 13)

                        End If
                    
                    End If

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero
                    'End If
                    '-------------------------------------------------

                    AumentoST = 15
                    AumentoHIT = 3
                    AumentoMANA = .Stats.UserAtributos(Inteligencia)
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWsemi" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                        'If Elixir = 10 Then
                         '   AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 1
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + AdicionalHPGuerrero + 1

                        'End If

                        '---------------------------------------

                        AumentoST = 20
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 999)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1300)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 155)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 155)
                        Call AddtoVar(.Stats.MaxMAN, AumentoMANA, 9999 + ManaEquipado)
                        GoTo yap

                    End If

                    'If CInt(.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 1)) > STAT_MAXMAN Then AumentoMANA = 0

                    'HP
                    Call AddtoVar(.Stats.MaxHP, AumentoHP, STAT_MAXHP)

                    'EZE AGREGAR max vida del paladin
                    If .Stats.MaxHP >= 999 Then

                        .Stats.MaxHP = 999

                    End If

                    'Mana
                    If CInt((.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 2)) + 0) < STAT_MAXMAN Then AddtoVar .Stats.MaxMAN, AumentoMANA, 9999 + ManaEquipado

                    'STA
                    Call AddtoVar(.Stats.MaxSta, AumentoST, STAT_MAXSTA)

                    'Golpe
                    Call AddtoVar(.Stats.MaxHIT, AumentoHIT, STAT_MAXHIT)
                    Call AddtoVar(.Stats.MinHIT, AumentoHIT, STAT_MAXHIT)

                Case "Ladron"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 12)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 12)

                        End If

                    End If

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2)
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2)
                    'End If
                    '-------------------------------------------

                    AumentoST = 15 + AdicionalSTLadron
                    AumentoHIT = 1
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWnomagico" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'AumentoHP = RandomNumber(6, .Stats.UserAtributos(Constitucion) \ 2) + 1
                        'pluto:6.5-----------------------------
                        'If Elixir = 10 Then
                            'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 1
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 1

                        'End If

                        '-------------------------------------
                        AumentoST = 20
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 625)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1500)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 110)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 110)
                        GoTo yap

                    End If

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP

                    'EZE AGREGAR max vida del ladron
                    If .Stats.MaxHP >= 675 Then

                        .Stats.MaxHP = 675

                    End If

                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA
                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Mago"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(3, 6) + Elixir
                        Else
                            AumentoHP = RandomNumber(3, 6)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(3, 7) + Elixir
                        Else
                            AumentoHP = RandomNumber(3, 7)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(4, 7) + Elixir
                        Else
                            AumentoHP = RandomNumber(4, 7)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(4, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(4, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 9)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 10)

                        End If
                    
                    End If

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) - 1
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) - 1
                    'End If
                    '-----------------------------------------------------------------------

                    If AumentoHP < 1 Then AumentoHP = 4
                    AumentoST = 15 - AdicionalSTLadron / 2

                    If AumentoST < 1 Then AumentoST = 5
                    AumentoHIT = 1
                    AumentoMANA = 3 * .Stats.UserAtributos(Inteligencia)
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWmagico" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                        'If Elixir = 10 Then
                         '   AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2)
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2)

                        'End If

                        '----------------------------------------------- Vida remort mago
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 999)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1500)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 99)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 99)
                        Call AddtoVar(.Stats.MaxMAN, AumentoMANA, 9999 + ManaEquipado)
                        GoTo yap

                    End If

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP

                    'EZE AGREGAR max vida del mago
                    If .Stats.MaxHP >= 999 Then

                        .Stats.MaxHP = 999

                    End If

                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA

                    'Mana
                    If CInt((.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 2) * 3) + 107) < STAT_MAXMAN Then AddtoVar .Stats.MaxMAN, AumentoMANA, 9999 + ManaEquipado
                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Leñador"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)), .Stats.UserAtributos(Constitucion) \ 2)
                    AumentoST = 15 + AdicionalSTLeñador
                    AumentoHIT = 2
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWcurro" & .Stats.ELV)

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP
                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA
                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Minero"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)), .Stats.UserAtributos(Constitucion) \ 2)
                    AumentoST = 15 + AdicionalSTMinero
                    AumentoHIT = 2
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWcurro" & .Stats.ELV)

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP
                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA
                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Pescador"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)), .Stats.UserAtributos(Constitucion) \ 2)
                    AumentoST = 15 + AdicionalSTPescador
                    AumentoHIT = 1
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWcurro" & .Stats.ELV)

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP
                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA
                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Clerigo"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(4, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(4, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 10)

                        End If

                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 11)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 12)

                        End If
                    
                    End If
                    
    

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2)
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2)
                    'End If
                    '--------------------------------

                    AumentoST = 15
                    AumentoHIT = 2
                    AumentoMANA = 2 * .Stats.UserAtributos(Inteligencia)
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWsemi" & .Stats.ELV)

                    If (.Remort = 1) Then
                        AumentoST = 20

                        'pluto:6.0A------------------
                        If .Stats.ELV Mod (2) = 0 Then
                            AumentoHIT = 3
                        Else
                            AumentoHIT = 2

                        End If

                        '-------------------------
                        'pluto:6.5-----------------------------
                        'If Elixir = 10 Then
                         '   AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 2
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 2

                        'End If

                        '----------------------------------
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 999)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1500)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 110)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 110)
                        Call AddtoVar(.Stats.MaxMAN, AumentoMANA, 9999)
                        GoTo yap

                    End If

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP

                    'EZE AGREGAR max vida del ladron
                    If .Stats.MaxHP >= 999 Then

                        .Stats.MaxHP = 999

                    End If

                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA

                    'Mana
                    If CInt((.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 2) * 2) + 50) < STAT_MAXMAN Then AddtoVar .Stats.MaxMAN, AumentoMANA, 3000

                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Druida"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(3, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(3, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(4, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(4, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 10)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 11)

                        End If
                    
                    End If

                    'testeo aca 600 de vida maxima para no remort
                    'Call AddtoVar(.Stats.MaxHP, AumentoHP, 600)

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2)
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2)
                    'End If
                    '---------------------------------------
                    AumentoST = 15
                    AumentoHIT = 2
                    AumentoMANA = 2 * .Stats.UserAtributos(Inteligencia)
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWmagico" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5---------------------------------------------
                        'If Elixir = 10 Then
                         '   AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 2
                        'Else
                         '   AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 2

                        'End If

                        '-----------------------------------------------------

                        AumentoST = 20
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 999)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1000)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 99)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 99)
                        Call AddtoVar(.Stats.MaxMAN, AumentoMANA, 9999)
                        GoTo yap

                    End If

                    If CInt(.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 1) * 2) > STAT_MAXMAN Then AumentoMANA = 0
                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP

                    'EZE AGREGAR max vida del druida
                    If .Stats.MaxHP >= 999 Then

                        .Stats.MaxHP = 999

                    End If

                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA

                    'Mana
                    If CInt((.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 2) * 2) + 50) < STAT_MAXMAN Then AddtoVar .Stats.MaxMAN, AumentoMANA, 3000

                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Asesino"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 23 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 24 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 11)

                        End If
                    
                    End If
                    
                    If .Stats.UserAtributos(Constitucion) = 25 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(9, 12) + Elixir
                        Else
                            AumentoHP = RandomNumber(9, 12)

                        End If
                    
                    End If

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    ' AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 1
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 1
                    'End If

                    AumentoST = 15
                    AumentoHIT = 3
                    AumentoMANA = .Stats.UserAtributos(Inteligencia)
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWsemi" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                        If Elixir = 10 Then
                            AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 2
                        Else
                            AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 2

                        End If

                        '------------------------------------------

                        AumentoST = 20
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 650)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1500)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 120)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 120)
                        Call AddtoVar(.Stats.MaxMAN, AumentoMANA, 9999)
                        GoTo yap

                    End If

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP

                    'EZE AGREGAR max vida del ladron
                    If .Stats.MaxHP >= 675 Then

                        .Stats.MaxHP = 675

                    End If

                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA

                    'Mana
                    If CInt((.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 2)) + 50) < STAT_MAXMAN Then AddtoVar .Stats.MaxMAN, AumentoMANA, 3000

                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case "Bardo"

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 8) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 8)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 1
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 1
                    'End If

                    AumentoST = 15
                    AumentoHIT = 2
                    AumentoMANA = CInt(1.5 * .Stats.UserAtributos(Inteligencia))
                    'pluto:6.0A
                    Call SendData(ToIndex, Userindex, 0, "AWsemi" & .Stats.ELV)

                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                        If Elixir = 10 Then
                            AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 2
                        Else
                            AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 2

                        End If

                        '----------------------------------------
                        AumentoST = 18
                        AumentoHIT = 3
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 600)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1500)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 120)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 120)
                        Call AddtoVar(.Stats.MaxMAN, AumentoMANA, 9999)
                        GoTo yap

                    End If

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP

                    'EZE AGREGAR max vida del ladron
                    If .Stats.MaxHP >= 675 Then

                        .Stats.MaxHP = 675

                    End If

                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA

                    'Mana
                    If CInt((.Stats.UserAtributos(Inteligencia) * (.Stats.ELV - 2) * 1.5) + 50) < STAT_MAXMAN Then AddtoVar .Stats.MaxMAN, AumentoMANA, 3000

                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

                Case Else

                    If .Stats.UserAtributos(Constitucion) = 16 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(5, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(5, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 17 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 9) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 9)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 18 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(6, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(6, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 19 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 10) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 10)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 20 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(7, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(7, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 21 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    If .Stats.UserAtributos(Constitucion) = 22 Then

                        If Elixir = 10 Then
                            AumentoHP = RandomNumber(8, 11) + Elixir
                        Else
                            AumentoHP = RandomNumber(8, 11)

                        End If

                    End If

                    'pluto:6.5-----------------------------
                    'If Elixir = 10 Then
                    'AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2)
                    'Else
                    'AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 6 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2)
                    'End If
                    '--------------------------------------------

                    AumentoST = 15
                    AumentoHIT = 2

                    'pluto:6.0A------------------------
                    If .clase = "Bandido" Or .clase = "Domador" Then
                        Call SendData(ToIndex, Userindex, 0, "AWnomagico" & .Stats.ELV)
                    Else
                        Call SendData(ToIndex, Userindex, 0, "AWcurro" & .Stats.ELV)

                    End If

                    '-----------------------------------
                    If (.Remort = 1) Then

                        'pluto:6.5-----------------------------
                        If Elixir = 10 Then
                            AumentoHP = (.Stats.UserAtributos(Constitucion) \ 2) + 1
                        Else
                            AumentoHP = RandomNumber((.Stats.UserAtributos(Constitucion) \ 2) - 4 + (.Stats.UserAtributos(Constitucion) Mod (2)) + Elixir, .Stats.UserAtributos(Constitucion) \ 2) + 1

                        End If

                        '-----------------------------------------
                        AumentoST = 18
                        Call AddtoVar(.Stats.MaxHP, AumentoHP, 600)
                        Call AddtoVar(.Stats.MaxSta, AumentoST, 1000)
                        Call AddtoVar(.Stats.MaxHIT, AumentoHIT, 99)
                        Call AddtoVar(.Stats.MinHIT, AumentoHIT, 99)
                        GoTo yap

                    End If

                    'HP
                    AddtoVar .Stats.MaxHP, AumentoHP, STAT_MAXHP

                    'EZE AGREGAR max vida del ladron
                    If .Stats.MaxHP >= 650 Then

                        .Stats.MaxHP = 650

                    End If

                    'STA
                    AddtoVar .Stats.MaxSta, AumentoST, STAT_MAXSTA
                    'Golpe
                    AddtoVar .Stats.MaxHIT, AumentoHIT, STAT_MAXHIT
                    AddtoVar .Stats.MinHIT, AumentoHIT, STAT_MAXHIT

            End Select

yap:

            If AumentoHP > 0 Then SendData ToIndex, Userindex, 0, "||Has ganado " & AumentoHP & " puntos de vida." & "´" & FontTypeNames.FONTTYPE_INFO

            'pluto:6.5
            If Elixir > 0 Then

                If Elixir = 10 Then
                    SendData ToIndex, Userindex, 0, "||Has ganado el Máximo de puntos de vida gracias al Elixir de Vida." & "´" & FontTypeNames.FONTTYPE_INFO
                Else
                    SendData ToIndex, Userindex, 0, "||De los " & AumentoHP & " Puntos de vida " & Elixir & " han sido gracias al Elixir de Vida." & "´" & FontTypeNames.FONTTYPE_INFO

                End If

                Elixir = 0
                .flags.Elixir = 0

            End If

            '-----------------------------

            If AumentoST > 0 Then SendData ToIndex, Userindex, 0, "||Has ganado " & AumentoST & " puntos de vitalidad." & "´" & FontTypeNames.FONTTYPE_INFO

            If AumentoMANA > 0 Then SendData ToIndex, Userindex, 0, "||Has ganado " & AumentoMANA & " puntos de magia." & "´" & FontTypeNames.FONTTYPE_INFO

            If AumentoHIT > 0 Then
                SendData ToIndex, Userindex, 0, "||Tu golpe maximo aumento en " & AumentoHIT & " puntos." & "´" & FontTypeNames.FONTTYPE_INFO
                SendData ToIndex, Userindex, 0, "||Tu golpe minimo aumento en " & AumentoHIT & " puntos." & "´" & FontTypeNames.FONTTYPE_INFO

            End If

            .Stats.MinHP = .Stats.MaxHP
            Call EnviarSkills(Userindex)

            'Call EnviarSubirNivel(UserIndex, Pts)
            '[Tite]Party
            If .flags.party = True Then

                If partylist(.flags.partyNum).reparto = 1 Then
                    Call BalanceaPrivisLVL(.flags.partyNum)

                End If

            End If

            Call SendData(toParty, Userindex, 0, "DD27" & .Name)

            '[\Tite]
            senduserstatsbox Userindex

            If .Faccion.ArmadaReal = 1 And .Stats.ELV = 50 Then Call AgregarHechizoangel(Userindex, 37)

            If .Faccion.ArmadaReal = 1 And .Stats.ELV = 50 Then Call AgregarHechizoangel(Userindex, 38)

            If .Faccion.FuerzasCaos = 1 And .Stats.ELV = 50 Then Call AgregarHechizoangel(Userindex, 53)

            If .Faccion.FuerzasCaos = 1 And .Stats.ELV = 50 Then Call AgregarHechizoangel(Userindex, 52)

        End If

    End With

    Exit Sub

errhandler:
    Call LogError("Error CHECKUSERLEVEL --> " & Err.number & " D: " & Err.Description & "--> " & UserList(Userindex).Name & " -- " & UserList(Userindex).Stats.ELV)

    'LogError ("Error en la subrutina CheckUserLevel")
End Sub

Function PuedeAtravesarAgua(ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    PuedeAtravesarAgua = UserList(Userindex).flags.Navegando = 1 Or UserList(Userindex).flags.Vuela = 1    'Or UserList(UserIndex).Flags.Angel = 1 Or UserList(UserIndex).Flags.Demonio = 1
    Exit Function
fallo:
    Call LogError("puedeatravesaragua " & Err.number & " D: " & Err.Description)

End Function

Sub MoveUserChar(ByVal Userindex As Integer, ByVal nHeading As Byte)

    On Error GoTo fallo

    '¿Tiene un indece valido?
    If Userindex <= 0 Then
        Call CloseSocket(Userindex)
        Exit Sub

    End If

    With UserList(Userindex)
    
        'miqueas 14/12/2020
        'If .Char.Heading <> nHeading Then
        '.Char.Heading = nHeading
        'Call ChangeUserChar(ToMap, 0, .Pos.Map, Userindex, .Char.Body, .Char.Head, .Char.Heading, .Char.WeaponAnim, .Char.ShieldAnim, .Char.CascoAnim, .Char.Botas, .Char.AlasAnim)
        'End If
        '-------------------

        Dim nPos      As WorldPos
        Dim AdminHide As Integer

        'pluto:2.8.0
        If .Pos.Map <> 192 Then GoTo ppp    'dragfutbol

        If nHeading = 4 Then

            If MapData(.Pos.Map, .Pos.X - 1, .Pos.Y).NpcIndex > 0 Then

                If Npclist(MapData(.Pos.Map, .Pos.X - 1, .Pos.Y).NpcIndex).NPCtype = 21 Then
                    Call MoveNPCChar(MapData(.Pos.Map, .Pos.X - 1, .Pos.Y).NpcIndex, nHeading)

                End If

            End If

        End If

        '---------------
ppp:
        'Move
        nPos = .Pos
        Call HeadtoPos(nHeading, nPos)

        If LegalPos(.Pos.Map, nPos.X, nPos.Y, PuedeAtravesarAgua(Userindex)) Then
            AdminHide = 0

            If ((.flags.AdminInvisible = 1) And (.flags.Privilegios > 0)) Then AdminHide = 1

            If MapInfo(.Pos.Map).NumUsers > 1 Then
                Call SendData(ToMapButIndex, Userindex, .Pos.Map, "MP" & .Char.CharIndex & "," & nPos.X & "," & nPos.Y & "," & AdminHide)

            End If

            MapData(.Pos.Map, .Pos.X, .Pos.Y).Userindex = 0
            .Pos = nPos
            .Char.Heading = nHeading
            MapData(.Pos.Map, .Pos.X, .Pos.Y).Userindex = Userindex

        Else
            'else correct user's pos
            Call SendData2(ToIndex, Userindex, 0, 15, .Pos.X & "," & .Pos.Y)

        End If

        '----pluto:6.5 --------------controlamos si hay salida-------
        If MapData(.Pos.Map, .Pos.X, .Pos.Y).TileExit.Map > 0 Then
            Call ControlaSalidas(Userindex, .Pos.Map, .Pos.X, .Pos.Y)

        End If

        If .flags.Privilegios > 0 Or .flags.Muerto = 1 Then Exit Sub

        'pluto:6.0A-----Eventos de las casas encantadas-------
        If .Pos.Map = 171 Or .Pos.Map = 177 Then
            Call VigilarEventosCasas(Userindex)

        End If

        '-------------Eventos sala invocación---------------
        If .Pos.Map = mapi Then Call VigilarEventosInvocacion(Userindex)

        '--------------Eventos Trampas------------------------
        If .Pos.Map = 178 Or .Pos.Map = 179 Then
            Call VigilarEventosTrampas(Userindex)

        End If

        '--------------------------------------------
    End With

    Exit Sub
fallo:
    Call LogError("moveuserchar " & Userindex & " D: " & Err.Description & " name: " & UserList(Userindex).Name & " mapa: " & UserList( _
            Userindex).Pos.Map & " X: " & UserList(Userindex).Pos.X & " Y: " & UserList(Userindex).Pos.Y)

End Sub

Sub ChangeUserInv(Userindex As Integer, Slot As Byte, Object As UserOBJ)

    On Error GoTo fallo

    UserList(Userindex).Invent.Object(Slot) = Object

    If Object.ObjIndex > 0 Then
        'pluto:6.0A
        Call SendData2(ToIndex, Userindex, 0, 32, Slot & "#" & Object.ObjIndex & "#" & Object.Amount & "#" & _
                                                  Object.Equipped)

    Else
        Call SendData2(ToIndex, Userindex, 0, 32, Slot & "#" & "0")    ' & "#" & "(None)" & "#" & "0" & "#" & "0")

    End If

    Exit Sub
fallo:
    Call LogError("changeuserinv " & Err.number & " D: " & Err.Description)

End Sub

Function NextOpenCharIndex() As Integer

    On Error GoTo fallo

    Dim loopc As Integer
    Dim n As Integer

    For loopc = 1 To LastChar + 1

        If CharList(loopc) = 0 Then

            'pluto:6.6 ANTICLONES--------------------
            For n = 1 To MaxUsers

                If UserList(n).Char.CharIndex = loopc Then
                    CharList(loopc) = UserList(n).Char.CharIndex
                    GoTo otro

                End If

            Next
            '-----------------------------------------
            NextOpenCharIndex = loopc

            'NumChars = NumChars + 1
            If loopc > LastChar Then LastChar = loopc
            Exit Function

        End If

otro:

    Next loopc

    Exit Function
fallo:
    Call LogError("nextopencharindex " & Err.number & " D: " & Err.Description)

End Function

Function NextOpenUser() As Integer

    On Error GoTo fallo

    Dim loopc As Long

    For loopc = 1 To MaxUsers + 1

        If loopc > MaxUsers Then Exit For

        'If (UserList(LoopC).ConnID = -1) Then Exit For
        'pluto:2.22-------------
        If (UserList(loopc).ConnID = -1 And UserList(loopc).flags.UserLogged = False) Then Exit For
        '-------------------------
    Next loopc

    NextOpenUser = loopc
    Exit Function
fallo:
    Call LogError("nextopenuser " & Err.number & " D: " & Err.Description)

End Function

'pluto:2.9.0
Sub SendUserClase(ByVal Userindex As Integer)

    On Error GoTo fallo

    'pluto:7.0 añado raza
    Call SendData2(ToIndex, Userindex, 0, 93, UserList(Userindex).clase & "," & UserList(Userindex).raza)
    Exit Sub
fallo:
    Call LogError("senduserclase " & Err.number & " D: " & Err.Description)

End Sub

'pluto:2.9.0
Sub SendUserMuertos(ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData(ToIndex, Userindex, 0, "K2" & UserList(Userindex).Faccion.CiudadanosMatados & "," & UserList( _
                                         Userindex).Faccion.CriminalesMatados & "," & UserList(Userindex).Faccion.NeutralesMatados)
    Exit Sub
fallo:
    Call LogError("sendusermuertos " & Err.number & " D: " & Err.Description)

End Sub

Sub senduserstatsbox(ByVal Userindex As Integer)

    On Error GoTo fallo
    
    If Userindex <= 0 Then Exit Sub

    Call SendData2(ToIndex, Userindex, 0, 23, UserList(Userindex).Stats.MaxHP & "," & UserList(Userindex).Stats.MinHP _
                                              & "," & UserList(Userindex).Stats.MaxMAN & "," & UserList(Userindex).Stats.MinMAN & "," & UserList( _
                                              Userindex).Stats.MaxSta & "," & UserList(Userindex).Stats.MinSta & "," & UserList(Userindex).Stats.GLD & _
                                              "," & UserList(Userindex).Stats.ELV & "," & UserList(Userindex).Stats.Elu & "," & UserList( _
                                              Userindex).Stats.exp)
    Exit Sub
fallo:
    Call LogError("senduserstatsbox " & Err.number & " D: " & Err.Description)

End Sub

'Delzak sistema premios

Sub SendUserPremios(ByVal Userindex As Integer)
    Dim n As Integer
    Dim ELogros As String

    On Error GoTo fallo

    For n = 1 To 34
        ELogros = ELogros & UserList(Userindex).Stats.PremioNPC(n) & ","
    Next

    'Mata NPCS1
    Call SendData(ToIndex, Userindex, 0, "D1" & ELogros)

    'Mata NPCS2
    'Call SendData(ToIndex, UserIndex, 0, "D2" & UserList(UserIndex).Stats.PremioNPC.MataMedusas & "," & UserList(UserIndex).Stats.PremioNPC.MataCiclopes & "," & UserList(UserIndex).Stats.PremioNPC.MataPolares & "," & UserList(UserIndex).Stats.PremioNPC.MataDevastadores & "," & UserList(UserIndex).Stats.PremioNPC.MataGigantes & "," & UserList(UserIndex).Stats.PremioNPC.MataPiratas & "," & UserList(UserIndex).Stats.PremioNPC.MataUruks & "," & UserList(UserIndex).Stats.PremioNPC.MataDemonios & "," & UserList(UserIndex).Stats.PremioNPC.Matadevir & "," & UserList(UserIndex).Stats.PremioNPC.MataGollums & "," & UserList(UserIndex).Stats.PremioNPC.MataDragones & "," & UserList(UserIndex).Stats.PremioNPC.Mataettin & "," & UserList(UserIndex).Stats.PremioNPC.MataPuertas & "," & UserList(UserIndex).Stats.PremioNPC.MataReyes & "," & UserList(UserIndex).Stats.PremioNPC.MataDefensores & "," & UserList(UserIndex).Stats.PremioNPC.MataRaids & "," & UserList(UserIndex).Stats.PremioNPC.MataNavidad)

    Exit Sub
fallo:
    Call LogError("senduserpremios " & Err.number & " D: " & Err.Description)

End Sub

Sub SendUserRazaClase(ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData(ToIndex, Userindex, 0, "J3" & UserList(Userindex).raza & "," & UserList(Userindex).clase)
    Exit Sub
fallo:
    Call LogError("senduserrazaclase " & Err.number & " D: " & Err.Description)

End Sub

'pluto:2.3
Sub SendUserStatsVida(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).Stats.MinHP < 0 Then UserList(Userindex).Stats.MinHP = 0
    Call SendData2(ToIndex, Userindex, 0, 24, UserList(Userindex).Stats.MaxHP & "," & UserList(Userindex).Stats.MinHP)
    Exit Sub
fallo:
    Call LogError("senduserstatsvida " & Err.number & " D: " & Err.Description)

End Sub

'pluto:2.3
Sub SendUserStatsMana(ByVal Userindex As Integer)

    On Error GoTo fallo


    Call SendData2(ToIndex, Userindex, 0, 25, UserList(Userindex).Stats.MaxMAN & "," & UserList(Userindex).Stats.MinMAN)
    Exit Sub
fallo:
    Call LogError("senduserstatsmana " & Err.number & " D: " & Err.Description)

End Sub

'pluto:2.3
Sub SendUserStatsEnergia(ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData2(ToIndex, Userindex, 0, 26, UserList(Userindex).Stats.MaxSta & "," & UserList(Userindex).Stats.MinSta)
    Exit Sub
fallo:
    Call LogError("senduserstatsenergia " & Err.number & " D: " & Err.Description)

End Sub

'pluto:2.3
Sub SendUserStatsOro(ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData2(ToIndex, Userindex, 0, 27, UserList(Userindex).Stats.GLD)
    Exit Sub
fallo:
    Call LogError("senduserstatsoro" & Err.number & " D: " & Err.Description)

End Sub

'pluto:2.3
Sub SendUserStatsFama(ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData(ToIndex, Userindex, 0, "H2" & UserList(Userindex).Stats.Fama)

    Exit Sub
fallo:
    Call LogError("senduserstatsFama" & Err.number & " D: " & Err.Description)

End Sub

'pluto:2.3
Sub SendUserStatsEXP(ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData2(ToIndex, Userindex, 0, 28, UserList(Userindex).Stats.ELV & "," & UserList(Userindex).Stats.Elu & _
                                              "," & UserList(Userindex).Stats.exp & "," & UserList(Userindex).Stats.Elo)
    Exit Sub
fallo:
    Call LogError("senduserstatsexp " & Err.number & " D: " & Err.Description)

End Sub

Sub MigracionLeveL(ByVal Userindex As Integer)

    UserList(Userindex).Stats.exp = 99000000
    Call SendUserStatsEXP(Userindex)
    Call CheckUserLevel(Userindex)

End Sub

Sub MigracionObjeto(ByVal Userindex As Integer)
    Dim MiObj As obj
    MiObj.Amount = 1
    MiObj.ObjIndex = 474

    Call MeterItemEnInventario(Userindex, MiObj)



End Sub

Sub MigracionOro(ByVal Userindex As Integer)

    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD + 1000
    Call SendUserStatsOro(Userindex)

End Sub


'pluto:2.3
Sub SendUserStatsPeso(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).Stats.Peso < 0.001 Then UserList(Userindex).Stats.Peso = 0
    Call SendData2(ToIndex, Userindex, 0, 29, Round(UserList(Userindex).Stats.Peso, 3) & "#" & UserList( _
                                              Userindex).Stats.PesoMax)
    Exit Sub
fallo:
    Call LogError("senduserstatspeso " & Err.number & " D: " & Err.Description)

End Sub

Sub EnviarHambreYsed(ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData2(ToIndex, Userindex, 0, 46, UserList(Userindex).Stats.MaxAGU & "," & UserList( _
                                              Userindex).Stats.MinAGU & "," & UserList(Userindex).Stats.MaxHam & "," & UserList(Userindex).Stats.MinHam)
    Exit Sub
fallo:
    Call LogError("enviarhambreysed " & Err.number & " D: " & Err.Description)

End Sub

Sub SendUserMuertes(ByVal sendIndex As Integer, ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData(ToIndex, sendIndex, 0, "||Estadisticas de: " & UserList(Userindex).Name & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)
    Call SendData(ToIndex, sendIndex, 0, "||Hordas asesinados: " & UserList(Userindex).Faccion.CiudadanosMatados _
                                         & "´" & FontTypeNames.FONTTYPE_INFO)
    Call SendData(ToIndex, sendIndex, 0, "||Alianzas asesinados: " & UserList(Userindex).Faccion.CriminalesMatados _
                                         & "´" & FontTypeNames.FONTTYPE_INFO)
    Call SendData(ToIndex, sendIndex, 0, "||Neutrales asesinados: " & UserList(Userindex).Faccion.NeutralesMatados & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)
    Exit Sub
fallo:
    Call LogError("sendusermuertes " & Err.number & " D: " & Err.Description)

End Sub

Sub SendUserStatstxt(ByVal sendIndex As Integer, ByVal Userindex As Integer)

    On Error GoTo fallo

    Call SendData(ToIndex, sendIndex, 0, "||Estadisticas de: " & UserList(Userindex).Name & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)
    Call SendData(ToIndex, sendIndex, 0, "||Nivel: " & UserList(Userindex).Stats.ELV & "  EXP: " & UserList( _
                                         Userindex).Stats.exp & "/" & UserList(Userindex).Stats.Elu & "´" & FontTypeNames.FONTTYPE_INFO)
    Call SendData(ToIndex, sendIndex, 0, "||Clase: " & UserList(Userindex).clase & "´" & FontTypeNames.FONTTYPE_INFO)
    'Call SendData(ToIndex, sendIndex, 0, "||Vitalidad: " & UserList(UserIndex).Stats.FIT & FONTTYPENAMES.FONTTYPE_INFO)
    Call SendData(ToIndex, sendIndex, 0, "||Salud: " & UserList(Userindex).Stats.MinHP & "/" & UserList( _
                                         Userindex).Stats.MaxHP & "  Mana: " & UserList(Userindex).Stats.MinMAN & "/" & UserList( _
                                         Userindex).Stats.MaxMAN & "  Vitalidad: " & UserList(Userindex).Stats.MinSta & "/" & UserList( _
                                         Userindex).Stats.MaxSta & "´" & FontTypeNames.FONTTYPE_INFO)

    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
        Call SendData(ToIndex, sendIndex, 0, "||Menor Golpe/Mayor Golpe: " & UserList(Userindex).Stats.MinHIT & "/" & _
                                             UserList(Userindex).Stats.MaxHIT & " (" & ObjData(UserList( _
                                                                                               Userindex).Invent.WeaponEqpObjIndex).MinHIT & "/" & ObjData(UserList( _
                                                                                                                                                           Userindex).Invent.WeaponEqpObjIndex).MaxHIT & ")" & "´" & FontTypeNames.FONTTYPE_INFO)
    Else
        Call SendData(ToIndex, sendIndex, 0, "||Menor Golpe/Mayor Golpe: " & UserList(Userindex).Stats.MinHIT & "/" & _
                                             UserList(Userindex).Stats.MaxHIT & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
        Call SendData(ToIndex, sendIndex, 0, "||(CUERPO) Min Def/Max Def: " & ObjData(UserList( _
                                                                                      Userindex).Invent.ArmourEqpObjIndex).MinDef & "/" & ObjData(UserList( _
                                                                                                                                                  Userindex).Invent.ArmourEqpObjIndex).MaxDef & "´" & FontTypeNames.FONTTYPE_INFO)
    Else
        Call SendData(ToIndex, sendIndex, 0, "||(CUERPO) Min Def/Max Def: 0" & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    If UserList(Userindex).Invent.CascoEqpObjIndex > 0 Then
        Call SendData(ToIndex, sendIndex, 0, "||(CABEZA) Min Def/Max Def: " & ObjData(UserList( _
                                                                                      Userindex).Invent.CascoEqpObjIndex).MinDef & "/" & ObjData(UserList( _
                                                                                                                                                 Userindex).Invent.CascoEqpObjIndex).MaxDef & "´" & FontTypeNames.FONTTYPE_INFO)
    Else
        Call SendData(ToIndex, sendIndex, 0, "||(CABEZA) Min Def/Max Def: 0" & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    '[GAU]
    If UserList(Userindex).Invent.AlaEqpObjIndex > 0 Then
        Call SendData(ToIndex, sendIndex, 0, "||(ALAS) Min Def/Max Def: " & ObjData(UserList( _
                                                                                    Userindex).Invent.AlaEqpObjIndex).MinDef & "/" & ObjData(UserList( _
                                                                                                                                             Userindex).Invent.AlaEqpObjIndex).MaxDef & "´" & FontTypeNames.FONTTYPE_INFO)
    Else
        Call SendData(ToIndex, sendIndex, 0, "||(ALAS) Min Def/Max Def: 0" & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    '[GAU]

    '[GAU]
    If UserList(Userindex).Invent.BotaEqpObjIndex > 0 Then
        Call SendData(ToIndex, sendIndex, 0, "||(PIES) Min Def/Max Def: " & ObjData(UserList( _
                                                                                    Userindex).Invent.BotaEqpObjIndex).MinDef & "/" & ObjData(UserList( _
                                                                                                                                              Userindex).Invent.BotaEqpObjIndex).MaxDef & "´" & FontTypeNames.FONTTYPE_INFO)
    Else
        Call SendData(ToIndex, sendIndex, 0, "||(PIES) Min Def/Max Def: 0" & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    '[GAU]

    If UserList(Userindex).GuildInfo.GuildName <> "" Then
        Call SendData(ToIndex, sendIndex, 0, "||Clan: " & UserList(Userindex).GuildInfo.GuildName & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)

        If UserList(Userindex).GuildInfo.EsGuildLeader = 1 Then
            If UserList(Userindex).GuildInfo.ClanFundado = UserList(Userindex).GuildInfo.GuildName Then
                Call SendData(ToIndex, sendIndex, 0, "||Status:" & "Fundador/Lider" & "´" & FontTypeNames.FONTTYPE_INFO)
            Else
                Call SendData(ToIndex, sendIndex, 0, "||Status:" & "Lider" & "´" & FontTypeNames.FONTTYPE_INFO)

            End If

        Else
            Call SendData(ToIndex, sendIndex, 0, "||Status:" & UserList(Userindex).GuildInfo.GuildPoints & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If

        Call SendData(ToIndex, sendIndex, 0, "||User GuildPoints: " & UserList(Userindex).GuildInfo.GuildPoints & "´" _
                                             & FontTypeNames.FONTTYPE_INFO)

    End If

    Call SendData(ToIndex, sendIndex, 0, "||Oro: " & UserList(Userindex).Stats.GLD & "  Posicion: " & UserList( _
                                         Userindex).Pos.X & "," & UserList(Userindex).Pos.Y & " en mapa " & UserList(Userindex).Pos.Map & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)
    'pluto:2.15
    Call SendData(ToIndex, sendIndex, 0, "||Muertes Alianzas: " & UserList(Userindex).Faccion.CiudadanosMatados & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)
    Call SendData(ToIndex, sendIndex, 0, "||Muertes Hordas: " & UserList(Userindex).Faccion.CriminalesMatados & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, sendIndex, 0, "||Muertes Neutrales: " & UserList(Userindex).Faccion.NeutralesMatados & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)

    'PLUTO:2-3-04
    'Call SendData(ToIndex, sendIndex, 0, "||DragPuntos: " & UserList(UserIndex).Stats.Puntos & FONTTYPENAMES.FONTTYPE_INFO)
    Exit Sub
fallo:
    Call LogError("senduserstatstxt " & Err.number & " D: " & Err.Description)

End Sub

Sub SendESTADISTICAS(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim ci As String
    Dim ww1 As Integer
    Dim ww2 As Integer
    Dim ww3 As Byte
    Dim ww4 As Byte
    Dim ww5 As Byte
    Dim ww6 As Byte
    Dim ww7 As Byte
    Dim ww8 As Byte
    Dim ww9 As Byte
    Dim ww10 As Byte
    'pluto:7.0
    Dim AciertoArmas As Integer
    Dim AciertoProyectiles As Integer
    Dim DañoArmas As Integer
    Dim DañoProyectiles As Integer
    Dim Evasion As Integer
    Dim EvasionProyec As Integer
    Dim Escudos As Integer
    Dim ResisMagia As Integer
    Dim DañoMagia As Integer
    Dim DefensaFisica As Integer

    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
        ww1 = ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).MinHIT
        ww2 = ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).MaxHIT
    Else
        ww1 = 0
        ww2 = 0

    End If

    If UserList(Userindex).Invent.CascoEqpObjIndex > 0 Then
        ww3 = ObjData(UserList(Userindex).Invent.CascoEqpObjIndex).MinDef
        ww4 = ObjData(UserList(Userindex).Invent.CascoEqpObjIndex).MaxDef
    Else
        ww3 = 0
        ww4 = 0

    End If

    If UserList(Userindex).Invent.BotaEqpObjIndex > 0 Then
        ww5 = ObjData(UserList(Userindex).Invent.BotaEqpObjIndex).MinDef
        ww6 = ObjData(UserList(Userindex).Invent.BotaEqpObjIndex).MaxDef
    Else
        ww5 = 0
        ww6 = 0

    End If

    If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
        ww7 = ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex).MinDef
        ww8 = ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex).MaxDef
    Else
        ww7 = 0
        ww8 = 0

    End If

    If UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then
        ww9 = ObjData(UserList(Userindex).Invent.EscudoEqpObjIndex).MinDef
        ww10 = ObjData(UserList(Userindex).Invent.EscudoEqpObjIndex).MaxDef
    Else
        ww9 = 0
        ww10 = 0

    End If

    ci = UserList(Userindex).Stats.MinHIT & "," & UserList(Userindex).Stats.MaxHIT & "," & ww1 & "," & ww2 & "," & _
         ww7 & "," & ww8 & "," & ww3 & "," & ww4 & "," & ww9 & "," & ww10 & "," & ww5 & "," & ww6 & "," & UserList( _
         Userindex).GuildInfo.GuildPoints
    'pluto:2.22
    Dim Solicit As Integer
    Solicit = (10 - UserList(Userindex).GuildInfo.ClanesParticipo)
    ci = ci & "," & UserList(Userindex).Stats.PClan & "," & UserList(Userindex).Stats.Puntos & "," & UserList( _
         Userindex).Stats.GTorneo & "," & UserList(Userindex).GuildInfo.ClanesParticipo & "," & Solicit
    'pluto:7.0
    'acierto armas
    AciertoArmas = PoderAtaqueArma(Userindex)
    DañoArmas = PoderDañoArma(Userindex)
    AciertoProyectiles = PoderAtaqueProyectil(Userindex)
    DañoProyectiles = PoderDañoProyectiles(Userindex)
    Escudos = PoderEvasionEscudo(Userindex)
    Evasion = PoderEvasion(Userindex, Tacticas)
    EvasionProyec = PoderEvasion(Userindex, EvitarProyec)
    ResisMagia = PoderResistenciaMagias(Userindex)
    DañoMagia = PoderDañoMagias(Userindex)
    DefensaFisica = PoderDefensaFisica(Userindex)
    ci = ci & "," & AciertoArmas & "," & DañoArmas & "," & AciertoProyectiles & "," & DañoProyectiles & "," & Escudos _
         & "," & Evasion & "," & EvasionProyec & "," & ResisMagia & "," & DañoMagia & "," & DefensaFisica
    Call SendData(ToIndex, Userindex, 0, "J2" & ci)
    Exit Sub

fallo:
    Call LogError("sendESTADISTICAS " & Err.number & " D: " & Err.Description)

End Sub

Sub SendUserInvTxt(ByVal sendIndex As Integer, ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim J As Integer
    Call SendData(ToIndex, sendIndex, 0, "||" & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_INFO)
    Call SendData(ToIndex, sendIndex, 0, "|| Tiene " & UserList(Userindex).Invent.NroItems & " objetos." & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)

    For J = 1 To MAX_INVENTORY_SLOTS

        If UserList(Userindex).Invent.Object(J).ObjIndex > 0 Then
            Call SendData(ToIndex, sendIndex, 0, "|| Objeto " & J & " " & ObjData(UserList(Userindex).Invent.Object( _
                                                                                  J).ObjIndex).Name & " Cantidad:" & UserList(Userindex).Invent.Object(J).Amount & "´" & _
                                                                                  FontTypeNames.FONTTYPE_INFO)

        End If

    Next
    Exit Sub
fallo:
    Call LogError("senduserinvtxt " & Err.number & " D: " & Err.Description)

End Sub

Sub SendUserSkillsTxt(ByVal sendIndex As Integer, ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim J As Integer
    Call SendData(ToIndex, sendIndex, 0, "||" & UserList(Userindex).Name & "´" & FontTypeNames.FONTTYPE_INFO)

    For J = 1 To NUMSKILLS
        Call SendData(ToIndex, sendIndex, 0, "|| " & SkillsNames(J) & " = " & UserList(Userindex).Stats.UserSkills(J) _
                                             & "´" & FontTypeNames.FONTTYPE_INFO)
    Next
    Exit Sub
fallo:
    Call LogError("senduserskillstxt " & Err.number & " D: " & Err.Description)

End Sub

Sub UpdateUserMap(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim Map As Integer
    Dim X As Integer
    Dim Y As Integer

    Map = UserList(Userindex).Pos.Map
    
    Dim NPCAnterior As Integer
    NPCAnterior = UserList(Userindex).flags.AfectaNPC
    
    If NPCAnterior > 0 Then
        Npclist(NPCAnterior).flags.Oponente = 0
    End If
    UserList(Userindex).flags.AfectaNPC = 0


    'pluto:2.17 añade ciudades sin invi
    If MapInfo(UserList(Userindex).Pos.Map).Invisible = 1 Then
        UserList(Userindex).flags.Invisible = 0
        UserList(Userindex).Counters.Invisibilidad = 0
        UserList(Userindex).flags.Oculto = 0

    End If

    For Y = YMinMapSize To YMaxMapSize
        For X = XMinMapSize To XMaxMapSize

            If MapData(Map, X, Y).Userindex > 0 And Userindex <> MapData(Map, X, Y).Userindex Then
                Call MakeUserChar(ToIndex, Userindex, 0, MapData(Map, X, Y).Userindex, Map, X, Y)

                If UserList(MapData(Map, X, Y).Userindex).flags.Invisible = 1 Then Call SendData2(ToIndex, Userindex, _
                                                                                                  0, 16, UserList(MapData(Map, X, Y).Userindex).Char.CharIndex & ",1")

            End If

            If MapData(Map, X, Y).NpcIndex > 0 Then
                Call MakeNPCChar(ToIndex, Userindex, 0, MapData(Map, X, Y).NpcIndex, Map, X, Y)

                'pluto:6.0A-----------------------------
                If Npclist(MapData(Map, X, Y).NpcIndex).Raid > 0 Then
                    Call SendData(ToMapButIndex, Userindex, UserList(Userindex).Pos.Map, "H4" & Npclist(MapData(Map, _
                                                                                                                X, Y).NpcIndex).Char.CharIndex & "," & Npclist(MapData(Map, X, Y).NpcIndex).Stats.MinHP)

                End If

                '---------------------------------------------------
            End If

            If MapData(Map, X, Y).OBJInfo.ObjIndex > 0 Then
                Call MakeObj(ToIndex, Userindex, 0, MapData(Map, X, Y).OBJInfo, Map, X, Y)

                If ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).OBJType = OBJTYPE_PUERTAS Then
                    Call Bloquear(ToIndex, Userindex, 0, Map, X, Y, MapData(Map, X, Y).Blocked)
                    Call Bloquear(ToIndex, Userindex, 0, Map, X - 1, Y, MapData(Map, X - 1, Y).Blocked)

                End If

            End If

        Next X
    Next Y

    Exit Sub
fallo:
    Call LogError("updateusermap " & Err.number & " D: " & Err.Description)

End Sub

Function DameUserindex(SocketId As Integer) As Integer

    On Error GoTo fallo

    Dim loopc As Integer

    loopc = 1

    Do Until UserList(loopc).ConnID = SocketId

        loopc = loopc + 1

        If loopc > MaxUsers Then
            DameUserindex = 0
            Exit Function

        End If

    Loop

    DameUserindex = loopc
    Exit Function
fallo:
    Call LogError("dameuserindex " & Err.number & " D: " & Err.Description)

End Function

Function DameUserIndexConNombre(ByVal Nombre As String) As Integer

    On Error GoTo fallo

    Dim loopc As Integer

    loopc = 1

    Nombre = UCase$(Nombre)

    Do Until UCase$(UserList(loopc).Name) = Nombre

        loopc = loopc + 1

        If loopc > MaxUsers Then
            DameUserIndexConNombre = 0
            Exit Function

        End If

    Loop

    DameUserIndexConNombre = loopc
    Exit Function
fallo:
    Call LogError("dameuserindexconnombre " & Err.number & " D: " & Err.Description)

End Function

Function EsMascotaCiudadano(ByVal NpcIndex As Integer, _
                            ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    If Npclist(NpcIndex).MaestroUser > 0 Then

        'pluto:2.18
        If UserList(Userindex).Faccion.ArmadaReal = 1 And Not Criminal(Npclist(NpcIndex).MaestroUser) Then
            EsMascotaCiudadano = True
            Exit Function

        End If

        '---------------
        EsMascotaCiudadano = Not Criminal(Npclist(NpcIndex).MaestroUser)

        If EsMascotaCiudadano Then Call SendData(ToIndex, Npclist(NpcIndex).MaestroUser, 0, "||¡¡" & UserList( _
                                                                                            Userindex).Name & " esta atacando tu mascota!!" & "´" & FontTypeNames.FONTTYPE_FIGHT)

    End If

    Exit Function
fallo:
    Call LogError("esmascotaciudadano " & Err.number & " D: " & Err.Description)

End Function

Sub NpcAtacado(ByVal NpcIndex As Integer, ByVal Userindex As Integer)
    Dim MinPc As npc

    MinPc = Npclist(NpcIndex)

    On Error GoTo fallo

    'Guardamos el usuario que ataco el npc
    Npclist(NpcIndex).flags.AttackedBy = UserList(Userindex).Name

    'respown esbirros del caballero de la muerte

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 500000 And Npclist( _
       NpcIndex).Stats.MinHP > 499000 Then Call SpawnNpc(727, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 500000 And Npclist( _
       NpcIndex).Stats.MinHP > 499000 Then Call SpawnNpc(728, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 500000 And Npclist( _
       NpcIndex).Stats.MinHP > 499000 Then Call SpawnNpc(729, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 500000 And Npclist( _
       NpcIndex).Stats.MinHP > 499000 Then Call SpawnNpc(730, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 400000 And Npclist( _
       NpcIndex).Stats.MinHP > 399000 Then Call SpawnNpc(727, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 400000 And Npclist( _
       NpcIndex).Stats.MinHP > 399000 Then Call SpawnNpc(728, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 400000 And Npclist( _
       NpcIndex).Stats.MinHP > 399000 Then Call SpawnNpc(729, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 400000 And Npclist( _
       NpcIndex).Stats.MinHP > 399000 Then Call SpawnNpc(730, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 200000 And Npclist( _
       NpcIndex).Stats.MinHP > 199000 Then Call SpawnNpc(727, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 200000 And Npclist( _
       NpcIndex).Stats.MinHP > 199000 Then Call SpawnNpc(728, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 200000 And Npclist( _
       NpcIndex).Stats.MinHP > 199000 Then Call SpawnNpc(729, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 200000 And Npclist( _
       NpcIndex).Stats.MinHP > 199000 Then Call SpawnNpc(730, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 20000 And Npclist( _
       NpcIndex).Stats.MinHP > 18000 Then Call SpawnNpc(727, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 20000 And Npclist( _
       NpcIndex).Stats.MinHP > 18000 Then Call SpawnNpc(728, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 20000 And Npclist( _
       NpcIndex).Stats.MinHP > 18000 Then Call SpawnNpc(729, MinPc.Pos, True, False)

    If MinPc.numero = 726 And Npclist(NpcIndex).Pos.Map = 279 And Npclist(NpcIndex).Stats.MinHP < 20000 And Npclist( _
       NpcIndex).Stats.MinHP > 18000 Then Call SpawnNpc(730, MinPc.Pos, True, False)

    'respown esbirros del caballero de la muerte

    'COMPROBAMOS ATAQUE A CASTILLOS
    'rey herido
    If Npclist(NpcIndex).Pos.Map = 185 And Npclist(NpcIndex).Name = "Defensor Fortaleza" Then
        Call SendData(ToAll, 0, 0, "V8")
        AtaForta = 1

    End If

    'If Npclist(NpcIndex).Pos.Map = 185 And Npclist(NpcIndex).Name = "Defensor Fortaleza" And Npclist(NpcIndex).Stats.MinHP > 5000 And Npclist(NpcIndex).Stats.MinHP < 6000 Then Call SendData(ToAll, 0, 0, "V9")

    'If Npclist(NpcIndex).Pos.Map = mapa_castillo1 And Npclist(NpcIndex).NPCtype = 33 Or (Npclist(NpcIndex).Pos.Map = mapa_castillo1 + 102 And (Npclist(NpcIndex).NPCtype = 77 Or Npclist(NpcIndex).NPCtype = 78)) Then
    'pluto:6.0A cambio la linea de arriba por la de abajo
    If Npclist(NpcIndex).Pos.Map = mapa_castillo1 And (Npclist(NpcIndex).NPCtype = 33 Or Npclist(NpcIndex).NPCtype = _
                                                       78) Then
        Call SendData(ToAll, 0, 0, "C1")
        AtaNorte = 1

    End If

    If Npclist(NpcIndex).Pos.Map = mapa_castillo2 And (Npclist(NpcIndex).NPCtype = 33 Or Npclist(NpcIndex).NPCtype = _
                                                       78) Then
        Call SendData(ToAll, 0, 0, "C2")
        AtaSur = 1

    End If

    If Npclist(NpcIndex).Pos.Map = mapa_castillo3 And (Npclist(NpcIndex).NPCtype = 33 Or Npclist(NpcIndex).NPCtype = _
                                                       78) Then
        Call SendData(ToAll, 0, 0, "C3")
        AtaEste = 1

    End If

    If Npclist(NpcIndex).Pos.Map = mapa_castillo4 And (Npclist(NpcIndex).NPCtype = 33 Or Npclist(NpcIndex).NPCtype = _
                                                       78) Then
        Call SendData(ToAll, 0, 0, "C4")
        AtaOeste = 1

    End If

    If Npclist(NpcIndex).MaestroUser > 0 Then Call AllMascotasAtacanUser(Userindex, Npclist(NpcIndex).MaestroUser)
    If EsMascotaCiudadano(NpcIndex, Userindex) Then
        'Call VolverCriminal(Userindex)
        Npclist(NpcIndex).Movement = NPCDEFENSA
        Npclist(NpcIndex).Hostile = 1
    Else

        'Reputacion
        If Npclist(NpcIndex).Stats.Alineacion = 0 Then

            'pluto:2.11
            If Npclist(NpcIndex).NPCtype = NPCTYPE_GUARDIAS Then
                'Call VolverCriminal(Userindex)
            Else
                'Call AddtoVar(UserList(Userindex).Reputacion.BandidoRep, vlASALTO, MAXREP)

            End If

        ElseIf Npclist(NpcIndex).Stats.Alineacion = 1 Then
            'Call AddtoVar(UserList(Userindex).Reputacion.PlebeRep, vlCAZADOR / 2, MAXREP)

        End If

        'hacemos que el npc se defienda
        Npclist(NpcIndex).Movement = NPCDEFENSA
        Npclist(NpcIndex).Hostile = 1

    End If

    'pluto:2.14
    If Npclist(NpcIndex).flags.PoderEspecial2 > 0 Then

        If Distancia(UserList(Userindex).Pos, Npclist(NpcIndex).Pos) > 1 Or (MapData(Npclist(NpcIndex).Pos.Map, _
                                                                                     Npclist(NpcIndex).Pos.X, Npclist(NpcIndex).Pos.Y - 1).Userindex > 0 Or MapData(Npclist( _
                                                                                                                                                                    NpcIndex).Pos.Map, Npclist(NpcIndex).Pos.X, Npclist(NpcIndex).Pos.Y + 1).Userindex > 0 Or MapData( _
                                                                                                                                                                    Npclist(NpcIndex).Pos.Map, Npclist(NpcIndex).Pos.X, Npclist(NpcIndex).Pos.X - 1).Userindex > 0 Or _
                                                                                                                                                                    MapData(Npclist(NpcIndex).Pos.Map, Npclist(NpcIndex).Pos.X, Npclist(NpcIndex).Pos.X + 1).Userindex > _
                                                                                                                                                                    0) Then
            Dim pvalida As Boolean
            Dim Newpos As WorldPos
            Dim it As Byte

            Do While Not pvalida
                Call ClosestLegalPos(UserList(Userindex).Pos, Newpos, Npclist(NpcIndex).flags.AguaValida)    'Nos devuelve la posicion valida mas cercana

                If LegalPosNPC(Newpos.Map, Newpos.X, Newpos.Y, Npclist(NpcIndex).flags.AguaValida) Then
                    'Asignamos las nuevas coordenas solo si son validas
                    MapData(Npclist(NpcIndex).Pos.Map, Npclist(NpcIndex).Pos.X, Npclist(NpcIndex).Pos.Y).NpcIndex = 0

                    Npclist(NpcIndex).Pos.Map = Newpos.Map
                    Npclist(NpcIndex).Pos.X = Newpos.X
                    Npclist(NpcIndex).Pos.Y = Newpos.Y
                    pvalida = True

                End If

                it = it + 1

                If it > 20 Then Exit Sub
            Loop
            Call SendData(ToMap, 0, Npclist(NpcIndex).Pos.Map, "MP" & Npclist(NpcIndex).Char.CharIndex & "," & _
                                                               Npclist(NpcIndex).Pos.X & "," & Npclist(NpcIndex).Pos.Y & ",0")

        End If

    End If

    'pluto:2.20 añado >0
    If Npclist(NpcIndex).flags.PoderEspecial5 > 0 And Npclist(NpcIndex).Stats.MinHP > 0 Then
        Dim n2 As Byte
        n2 = RandomNumber(1, 100)

        If n2 > 70 Then
            Call SendData2(ToMap, 0, Npclist(NpcIndex).Pos.Map, 22, Npclist(NpcIndex).Char.CharIndex & "," & 31 & "," _
                                                                    & 1)
            Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MinHP + 300

            'Call SendData(ToPCArea, userindex, UserList(userindex).Pos.Map, "TW" & 18)
            If Npclist(NpcIndex).Stats.MinHP > Npclist(NpcIndex).Stats.MaxHP Then Npclist(NpcIndex).Stats.MinHP = _
               Npclist(NpcIndex).Stats.MaxHP

        End If

    End If

    Exit Sub
fallo:
    Call LogError("npcatacado " & Err.number & " D: " & Err.Description)

End Sub

Function PuedeDobleArma(ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    'pluto:2.15
    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
        If ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).SubTipo = 6 Then
            PuedeDobleArma = True
        Else
            PuedeDobleArma = False

        End If

    End If

    Exit Function
fallo:
    Call LogError("puededoblearma " & Err.number & " D: " & Err.Description)

End Function

Function PuedeApuñalar(ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    'pluto:2.15
    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 And UserList(Userindex).clase <> "Druida" Then
        PuedeApuñalar = ((UserList(Userindex).Stats.UserSkills(Apuñalar) >= MIN_APUÑALAR) And (ObjData(UserList( _
                                                                                                       Userindex).Invent.WeaponEqpObjIndex).Apuñala = 1)) Or ((UserList(Userindex).clase = "Asesino") And ( _
                                                                                                                                                              ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).Apuñala = 1))
    Else
        PuedeApuñalar = False

    End If

    Exit Function
fallo:
    Call LogError("puedeapuñalar " & Err.number & " D: " & Err.Description)

End Function

Sub SubirSkill(ByVal Userindex As Integer, ByVal Skill As Integer)

    On Error GoTo fallo

    'pluto:2.17
    If UserList(Userindex).Bebe > 0 Then Exit Sub

    If UserList(Userindex).flags.Hambre = 0 And UserList(Userindex).flags.Sed = 0 Then
        Dim Aumenta As Integer
        Dim PROB As Integer

        'pluto:6.3--------------
        If ServerPrimario = 1 Then
            PROB = 8
        Else
            PROB = 8

        End If

        '--------------------------
        Aumenta = Int(RandomNumber(1, PROB))

        Dim lvl As Integer
        lvl = UserList(Userindex).Stats.ELV

        If lvl >= UBound(LevelSkill) Then Exit Sub
        If UserList(Userindex).Stats.UserSkills(Skill) = MAXSKILLPOINTS Then Exit Sub

        'nati: aumento los skillpoint a 5
        If Aumenta < 5 And UserList(Userindex).Stats.UserSkills(Skill) < LevelSkill(lvl).LevelValue Then
            Call AddtoVar(UserList(Userindex).Stats.UserSkills(Skill), 1, MAXSKILLPOINTS)
            Call SendData(ToIndex, Userindex, 0, "||¡Has mejorado tu skill " & SkillsNames(Skill) & _
                                                 " en un punto!. Ahora tienes " & UserList(Userindex).Stats.UserSkills(Skill) & " pts." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
            'pluto:2.19
            Dim Sk As Long
            Sk = UserList(Userindex).Stats.UserSkills(Skill)
            Call AddtoVar(UserList(Userindex).Stats.exp, Sk, MAXEXP)
            Call SendData(ToIndex, Userindex, 0, "||¡Has ganado " & Sk & " puntos de experiencia!" & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)
            'pluto:2.4.5
            Call CheckUserLevel(Userindex)
            Call senduserstatsbox(Userindex)
            'pluto:2.17
            Call EnviaUnSkills(Userindex, Skill)

        End If

    End If

    Exit Sub
fallo:
    Call LogError("subirskill Nom: " & UserList(Userindex).Name & " Sk: " & Skill & Err.number & " D: " & _
                  Err.Description)

End Sub

Sub UserDie(ByVal Userindex As Integer)

    'Call LogTarea("Sub UserDie")
    On Error GoTo ErrorHandler

    With UserList(Userindex)

        'Sonido
        If .Genero = "Hombre" Then
            Call SendData(ToPCArea, Userindex, .Pos.Map, "TW" & SND_USERMUERTE)
        Else
            Call SendData(ToPCArea, Userindex, .Pos.Map, "TW" & 182)    ' sonido muerte femenino

        End If

        'PLUTO:6.8---------------
        If .flags.Macreanda > 0 Then
            .flags.ComproMacro = 0
            .flags.Macreanda = 0
            Call SendData(ToIndex, Userindex, 0, "O3")

        End If
    
        'If .flags.SeguroRev = False Then
        '.flags.SeguroRev = True
        'Call SendData(ToIndex, Userindex, 0, "||Tu seguro de resu se ha activado!!" & "´" & FontTypeNames.FONTTYPE_pluto)
        'End If

        '--------------------------

        'Quitar el dialogo del user muerto
        Call SendData2(ToPCArea, Userindex, .Pos.Map, 21, .Char.CharIndex)
        
        
        Dim NPCAnterior As Integer
        NPCAnterior = UserList(Userindex).flags.AfectaNPC
    
        If NPCAnterior > 0 Then
            Npclist(NPCAnterior).flags.Oponente = 0
        End If
        UserList(Userindex).flags.AfectaNPC = 0


        'pluto:2.11.0
        If .GranPoder > 0 Then
            .GranPoder = 0
            UserGranPoder = ""
            .Char.FX = 0
            Call SendData2(ToMap, Userindex, .Pos.Map, 22, .Char.CharIndex & "," & 68 & "," & 0)

        End If
     
        If .flags.ArenaBattleSlot > 0 Then
            Call RankedUserWinnerRound(Userindex, .flags.ArenaBattleSlot)
            Exit Sub
        End If
        
        .ObjetosTirados = 0
        .Stats.MinHP = 0
        .flags.AtacadoPorNpc = 0
        .flags.AtacadoPorUser = 0
        .flags.Envenenado = 0
        .flags.Muerto = 1
        .flags.Morph = 0
        .flags.Angel = 0
        .flags.Demonio = 0
    
        If .flags.Guerra = False Then
            '.flags.Guerra = False
            Call SendData(ToIndex, Userindex, 0, "|G0")

        End If
   
    
        If .flags.Guerra = True Then

            If CiudadGuerra = MapaGuerra1 Then

                If .Faccion.FuerzasCaos = 1 Then
                    WarpUserChar Userindex, MapaGuerra1, 77, 20, True

                End If

                If .Faccion.ArmadaReal = 1 Then
                    WarpUserChar Userindex, MapaGuerra1, 45, 88, True

                End If

            ElseIf CiudadGuerra = MapaGuerra2 Then

                If .Faccion.ArmadaReal = 1 Then
                    WarpUserChar Userindex, MapaGuerra2, 77, 20, True

                End If

                If .Faccion.FuerzasCaos = 1 Then
                    WarpUserChar Userindex, MapaGuerra2, 45, 88, True

                End If
        
            End If

        End If

        'pluto:6.2
        '.flags.ParejaTorneo = 0
        'pluto:2.9.0
        If .flags.Comerciando = True Then
            Call FinComerciarUsu(.ComUsu.DestUsu)
            Call FinComerciarUsu(Userindex)

        End If

        Dim aN As Integer

        aN = .flags.AtacadoPorNpc

        If aN > 0 Then
            Npclist(aN).Movement = Npclist(aN).flags.OldMovement
            Npclist(aN).Hostile = Npclist(aN).flags.OldHostil
            Npclist(aN).flags.AttackedBy = ""

        End If

        '<<<< Paralisis >>>>
        If .flags.Paralizado = 1 Then
            .flags.Paralizado = 0
            Call SendData2(ToIndex, Userindex, 0, 68)

        End If

        ' invisibilidad
        If .flags.Invisible = 1 Or .flags.Oculto = 1 Then
            .flags.Invisible = 0
            .Counters.Invisibilidad = 0
            .flags.Oculto = 0
            Call SendData2(ToMap, 0, .Pos.Map, 16, .Char.CharIndex & ",0")

        End If

        ' ceguera
        If .flags.Ceguera = 1 Then
            .flags.Ceguera = 0
            Call SendData2(ToIndex, Userindex, 0, 55)

        End If

        '<<<< Descansando >>>>
        If .flags.Descansar Then
            .flags.Descansar = False
            Call SendData2(ToIndex, Userindex, 0, 41)

        End If

        '<<<< Meditando >>>>
        If .flags.Meditando Then
            .flags.Meditando = False
            Call SendData2(ToIndex, Userindex, 0, 54)

        End If

        'desequipar armadura
        If .Invent.ArmourEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.ArmourEqpSlot)

        End If

        'desequipar arma
        If .Invent.WeaponEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.WeaponEqpSlot)

        End If

        'desequipar casco
        If .Invent.CascoEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.CascoEqpSlot)

        End If

        'desequipar casco
        If .Invent.EscudoEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.EscudoEqpSlot)

        End If

        If .Invent.AlaEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.AlaEqpSlot)

        End If

        '[GAU]
        'desequipar botas
        If .Invent.BotaEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.BotaEqpSlot)

        End If

        '[GAU]
        'Pluto:2.4
        If .Invent.AnilloEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.AnilloEqpSlot)

        End If

        '----fin Pluto:2.4---------
        'desequipar herramienta
        If .Invent.HerramientaEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.HerramientaEqpSlot)

        End If

        'desequipar municiones
        If .Invent.MunicionEqpObjIndex > 0 Then
            Call Desequipar(Userindex, .Invent.MunicionEqpSlot)

        End If

        ' << Si es newbie no pierde el inventario >>

        'pluto:7.0
        'If .raza = "Goblin" And RandomNumber(1, 100) > 75 Then GoTo notirarnada

        If Not EsNewbie(Userindex) Then
            Call TirarTodo(Userindex)
        Else

            If EsNewbie(Userindex) Then Call TirarTodosLosItemsNoNewbies(Userindex)

        End If

notirarnada:

        If .Remort = 0 Then

            If .Stats.MaxMAN > STAT_MAXMAN Then .Stats.MaxMAN = STAT_MAXMAN
        Else

            Select Case UCase$(.clase)

                Case "MAGO"

                    If .Stats.MaxMAN > 5000 Then .Stats.MaxMAN = 9999

                Case "CLERIGO"

                    If .Stats.MaxMAN > 4000 Then .Stats.MaxMAN = 9999

                Case "DRUIDA"

                    If .Stats.MaxMAN > 4000 Then .Stats.MaxMAN = 9999

                Case "BARDO"

                    If .Stats.MaxMAN > 4000 Then .Stats.MaxMAN = 9999

                Case "PALADIN"

                    If .Stats.MaxMAN > 4000 Then .Stats.MaxMAN = 9999

            End Select

        End If

        ' << Reseteamos los posibles FX sobre el personaje >>
        If .Char.loops = LoopAdEternum Then
            .Char.FX = 0
            .Char.loops = 0

        End If

        '<< Cambiamos la apariencia del char >>
        If .flags.Navegando = 0 Then

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
            .Char.Botas = NingunBota
            .Char.AlasAnim = NingunAla
            '[GAU]
        Else
            .Char.Body = iFragataFantasmal    ';)

        End If
    
        'Eze: Torneo Automatico
        If .flags.Automatico = True Then
            Call Rondas_UsuarioMuere(Userindex)

        End If
    
        'Eze: Torneo Automatico

        'Juegos del Hambre Automatico
        If .flags.HungerGames = True And .Pos.Map = 269 Then
            Call SendData(ToIndex, Userindex, 0, "|/Juegos del Hambre" & "> " & "Has perdido el evento ¡Suerte la próxima vez!")
            Call SendData(ToMap, 0, 269, "|/Juegos del Hambre" & "> ¡" & .Name & " fue asesinado por una criatura!")
            .flags.HungerGames = False
            Call WarpUserChar(Userindex, 34, 50, 50, True)
            Call HungerGames_Muere(Userindex)

        End If

        'Juegos del Hambre Automatico
    
        'blood castle
        If .flags.BloodGames = True And .Pos.Map = 205 Then
            Call SendData(ToIndex, Userindex, 0, "|/Blood Castle" & "> " & "Has perdido el evento ¡Suerte la próxima vez!")
            Call SendData(ToMap, 0, 205, "|/Blood Castle" & "> ¡" & .Name & " fue asesinado por una criatura!")
            .flags.BloodGames = False
            Call WarpUserChar(Userindex, 34, 50, 50, True)
            Call BloodGames_Muere(Userindex)

        End If

        'blood castle

        Dim i As Integer

        For i = 1 To MAXMASCOTAS

            If .MascotasIndex(i) > 0 Then

                If Npclist(.MascotasIndex(i)).Contadores.TiempoExistencia > 0 Then
                    Call MuereNpc(.MascotasIndex(i), 0)
                Else
                    Npclist(.MascotasIndex(i)).MaestroUser = 0
                    Npclist(.MascotasIndex(i)).Movement = Npclist(.MascotasIndex(i)).flags.OldMovement
                    Npclist(.MascotasIndex(i)).Hostile = Npclist(.MascotasIndex(i)).flags.OldHostil
                    'pluto:2.4
                    Call QuitarNPC(.MascotasIndex(i))

                    .MascotasIndex(i) = 0
                    .MascotasType(i) = 0

                End If

            End If

        Next i

        .NroMacotas = 0
        'pluto:2.3
        Call SendData2(ToIndex, Userindex, 0, 56)

        If .flags.Montura = 1 Then
            .Stats.PesoMax = .Stats.PesoMax - (UserList(Userindex).flags.ClaseMontura * 100)
            Call SendUserStatsPeso(Userindex)

        End If

        .flags.ClaseMontura = 0
        .flags.Montura = 0
        'pluto:6.3
        .flags.Estupidez = 0
        Call SendData2(ToIndex, Userindex, 0, 56)

        'If MapInfo(.Pos.Map).Pk Then
        '        Dim MiObj As Obj
        '        Dim nPos As WorldPos
        '        MiObj.ObjIndex = RandomNumber(554, 555)
        '        MiObj.Amount = 1
        '        nPos = TirarItemAlPiso(.Pos, MiObj)
        '        Dim ManchaSangre As New cGarbage
        '        ManchaSangre.Map = nPos.Map
        '        ManchaSangre.X = nPos.X
        '        ManchaSangre.Y = nPos.Y
        '        Call TrashCollector.Add(ManchaSangre)
        'End If

        '<< Actualizamos clientes >>
        '[GAU] Agregamo NingunBota

        Call ChangeUserChar(ToMap, 0, .Pos.Map, val(Userindex), .Char.Body, .Char.Head, .Char.Heading, NingunArma, NingunEscudo, NingunCasco, NingunBota, NingunAla)
        '[GAU]
        Call senduserstatsbox(Userindex)
    
        If .Pos.Map = 207 Then
            Call TodoRETO

        End If
 
        If .Pos.Map = 206 Then
            Call BaseRetoDoble

        End If

    End With

    Exit Sub

ErrorHandler:
    Call LogError("Error en SUB USERDIE Nom:" & UserList(Userindex).Name)

End Sub

Sub ContarMuerte(ByVal Muerto As Integer, ByVal atacante As Integer)

    On Error GoTo ErrorHandler

    'pluto:2.11
    If UserList(Muerto).GranPoder > 0 Then
        UserList(Muerto).GranPoder = 0
        UserList(Muerto).Char.FX = 0
        UserList(atacante).GranPoder = 1
        UserGranPoder = UserList(atacante).Name

    End If

    '--------fin pluto:2.4----------------

    If UserList(atacante).Pos.Map = mapatorneo Then
        'REVISAR
        'pluto:muere en torneo
        Call SendData(ToMap, 0, 296, "||Torneo: " & UserList(atacante).Name & " derrota a " & UserList(Muerto).Name & _
                                     "´" & FontTypeNames.FONTTYPE_talk)
        'Delzak) aviso nix y caos
        Call SendData(ToMap, 0, 34, "||Torneo: " & UserList(atacante).Name & " derrota a " & UserList(Muerto).Name & _
                                    "´" & FontTypeNames.FONTTYPE_talk)
        Call SendData(ToMap, 0, 170, "||Torneo: " & UserList(atacante).Name & " derrota a " & UserList(Muerto).Name & _
                                     "´" & FontTypeNames.FONTTYPE_talk)

        'Tite añade aviso Bander
        'Call SendData(ToMap, 0, 59, "||Torneo: " & UserList(atacante).Name & " derrota a " & UserList(Muerto).Name & "´" & FontTypeNames.FONTTYPE_talk)
        '\Tite
        'gana torneo
        If UserList(atacante).flags.LastCiudMatado <> UserList(Muerto).Name And UserList( _
           atacante).flags.LastCrimMatado <> UserList(Muerto).Name Then

            If Criminal(Muerto) Then UserList(atacante).flags.LastCrimMatado = UserList(Muerto).Name Else UserList( _
               atacante).flags.LastCiudMatado = UserList(Muerto).Name
            'UserList(atacante).Stats.GLD = UserList(atacante).Stats.GLD + (25 * UserList(Muerto).Stats.ELV)
            Call AddtoVar(UserList(atacante).Stats.GLD, (25 * UserList(Muerto).Stats.ELV), MAXORO)

            Call SendData(ToIndex, atacante, 0, "||Has ganado " & 25 * UserList(Muerto).Stats.ELV & " monedas." & "´" _
                                                & FontTypeNames.FONTTYPE_FIGHT)

            UserList(atacante).flags.Torneo = UserList(atacante).flags.Torneo + 1
            Call SendData(ToPCArea, atacante, UserList(atacante).Pos.Map, "TW" & SND_TORNEO)
            'pluto:2.4
            UserList(atacante).Stats.GTorneo = UserList(atacante).Stats.GTorneo + 1
            UserList(Muerto).Stats.GTorneo = UserList(Muerto).Stats.GTorneo - 1

        End If

        If UserList(atacante).flags.Torneo = 5 Then

            Call SendData(ToAll, 0, 0, "|| Ganador del torneo 5 veces consecutivas, " & UserList(atacante).Name & _
                                       " obtiene premio de 200 oros extras." & "´" & FontTypeNames.FONTTYPE_talk)
            'UserList(atacante).Stats.GLD = UserList(atacante).Stats.GLD + 2000
            Call AddtoVar(UserList(atacante).Stats.GLD, 200, MAXORO)

            Call SendData(ToIndex, atacante, 0, "TW" & 180)
            UserList(atacante).flags.Torneo = UserList(atacante).flags.Torneo + 1
            'pluto:6.0A
            UserList(atacante).Stats.Fama = UserList(atacante).Stats.Fama + 5

        End If

        If UserList(atacante).flags.Torneo = 11 Then
            Call SendData(ToAll, 0, 0, "|| Ganador del torneo 10 veces consecutivas, " & UserList(atacante).Name & _
                                       " obtiene premio de 500 oros extras." & "´" & FontTypeNames.FONTTYPE_talk)
            'UserList(atacante).Stats.GLD = UserList(atacante).Stats.GLD + 5000
            Call AddtoVar(UserList(atacante).Stats.GLD, 500, MAXORO)
            Call SendData(ToIndex, atacante, 0, "TW" & 180)
            UserList(atacante).flags.Torneo = UserList(atacante).flags.Torneo + 1
            'pluto:6.0A
            UserList(atacante).Stats.Fama = UserList(atacante).Stats.Fama + 15

        End If

        If UserList(atacante).flags.Torneo = 22 Then
            Call SendData(ToAll, 0, 0, "|| Ganador del torneo 20 veces consecutivas, " & UserList(atacante).Name & _
                                       " obtiene premio de 1500 oros extras." & "´" & FontTypeNames.FONTTYPE_talk)
            'UserList(atacante).Stats.GLD = UserList(atacante).Stats.GLD + 15000
            Call AddtoVar(UserList(atacante).Stats.GLD, 1500, MAXORO)
            Call SendData(ToIndex, atacante, 0, "TW" & 180)
            UserList(atacante).flags.Torneo = UserList(atacante).flags.Torneo + 1
            'pluto:6.0A
            UserList(atacante).Stats.Fama = UserList(atacante).Stats.Fama + 30

        End If

        'Exit Sub
    End If

    'pluto:2.12
    If UserList(atacante).Pos.Map = MapaTorneo2 Then
        UserList(atacante).Torneo2 = UserList(atacante).Torneo2 + 1

        If UserList(atacante).Torneo2 > 10 Then UserList(atacante).Torneo2 = 10
        UserList(Muerto).Torneo2 = 0
        MinutoSinMorir = 0

        If UserList(atacante).Torneo2 = 10 Then
            'UserList(atacante).Stats.GLD = UserList(atacante).Stats.GLD + TorneoBote
            Call AddtoVar(UserList(atacante).Stats.GLD, TorneoBote, MAXORO)
            Call SendData(ToIndex, atacante, 0, "TW" & 180)
            'pluto:6.0A
            UserList(atacante).Stats.Fama = UserList(atacante).Stats.Fama + 10
            Call SendUserStatsOro(atacante)
            TorneoBote = 0
            Torneo2Record = 0

        End If

        If UserList(atacante).Torneo2 > Torneo2Record Then
            Torneo2Record = UserList(atacante).Torneo2
            Torneo2Name = UserList(atacante).Name
            Call SendData2(ToMap, 0, MapaTorneo2, 96, Torneo2Name & "," & Torneo2Record & "," & TorneoBote)

        End If

        If UCase$(UserList(Muerto).Name) = UCase$(Torneo2Name) Then
            Torneo2Record = 0

        End If

        'Exit Sub
    End If

    '------------------ puntos clan---------------------
    If UserList(Muerto).GuildInfo.GuildName = "" Or UserList(atacante).GuildInfo.GuildName = "" Or UserList( _
       Muerto).GuildInfo.GuildName = UserList(atacante).GuildInfo.GuildName Or MapInfo(UserList( _
                                                                                       Muerto).Pos.Map).Terreno = "TORNEO" Then GoTo qq
                                                                                       
        If MapInfo(UserList(Muerto).Pos.Map).Terreno = "EVENTO" Then GoTo qq
        If MapInfo(UserList(Muerto).Pos.Map).Terreno = "TORNEOGM" Then GoTo qq

    'If MapInfo(UserList(Muerto).Pos.Map).Pk = True And UserList(Muerto).GuildRef.Reputation > 0 Then
    If MapInfo(UserList(Muerto).Pos.Map).Pk = True Then
        'UserList(Muerto).Stats.PClan = UserList(Muerto).Stats.PClan - 1
        'UserList(atacante).Stats.PClan = UserList(atacante).Stats.PClan + 1

        'nati: Aquí ganara puntos solo el personaje, no el clan.
        'pluto:6.5 añado que atacante tenga que tener puntos para poder sumarlos al clan
        'If UserList(Muerto).Stats.PClan > 0 And UserList(atacante).Stats.PClan > 0 Then
        UserList(Muerto).GuildRef.Reputation = UserList(Muerto).GuildRef.Reputation - 1
        UserList(atacante).GuildRef.Reputation = UserList(atacante).GuildRef.Reputation + 1
        UserList(atacante).Stats.PClan = UserList(atacante).Stats.PClan + 1
        Call SendData(ToIndex, atacante, 0, "||Has sumado 1 Punto de membresia!!" & "´" & FontTypeNames.FONTTYPE_pluto)
        Call SendData(ToIndex, atacante, 0, "||Has sumado 1 Punto al Clan!!" & "´" & FontTypeNames.FONTTYPE_pluto)
        Call SendData(ToIndex, Muerto, 0, "||Has Restado 1 Punto al Clan!!" & "´" & FontTypeNames.FONTTYPE_pluto)
        UserList(Muerto).flags.CMuerte = 1

        'End If
    End If

qq:
    '------------------fin puntos clan---------------------

    '--------------------drags puntos----------------
    'pluto:2-3-04
    If UserList(atacante).Stats.Puntos > 0 And UserList(Muerto).Stats.Puntos > 0 And MapInfo(UserList( _
                                                                                             Muerto).Pos.Map).Pk = True And UserList(Muerto).Stats.ELV > 15 Then
        Dim pun As Integer
        pun = 1

        'pluto.2.5.0
        If pun > UserList(Muerto).Stats.Puntos Then pun = UserList(Muerto).Stats.Puntos

        UserList(Muerto).Stats.Puntos = UserList(Muerto).Stats.Puntos - pun
        'PLUTO:2.4
        UserList(atacante).Stats.Puntos = UserList(atacante).Stats.Puntos + pun

        If UserList(Muerto).Stats.Puntos < 0 Then UserList(Muerto).Stats.Puntos = 0

        Call SendData(ToIndex, atacante, 0, "|| Has ganado " & pun & " Puntos de Canje." & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Muerto, 0, "|| Has pérdido " & pun & " Puntos de Canje." & "´" & FontTypeNames.FONTTYPE_INFO)
        UserList(Muerto).flags.CMuerte = 1

    End If

    '--------------------fin drags puntos----------------
    'pluto:5.2--añado cmuerte (1 minuto)
    If EsNewbie(Muerto) Then Exit Sub

    '-----------------------------armadas------------------
    'pluto:2.18 añade "castillo"
    'pluto:6.8 añade sala clan
    If MapInfo(UserList(Muerto).Pos.Map).Terreno = "CASTILLO" Or MapInfo(UserList(Muerto).Pos.Map).Terreno = "TORNEOGM" Or UserList(Muerto).Pos.Map = 185 Or MapInfo(UserList( _
                                                                                                           Muerto).Pos.Map).Terreno = "TORNEO" Or MapInfo(UserList(Muerto).Pos.Map).Zona = "CLAN" Or MapInfo(UserList(Muerto).Pos.Map).Zona = "EVENTO" Or UserList(Muerto).Pos.Map = 182 Or UserList(Muerto).Pos.Map = 92 Or UserList(Muerto).Pos.Map = 279 Then Exit Sub    'Or MapInfo(UserList(Muerto).Pos.Map).Terreno = "CONQUISTA" Then
    'If Not Criminal(Muerto) And Not Criminal(atacante) Then Exit Sub
    'If Criminal(Muerto) And Criminal(atacante) Then Exit Sub
    'End If
    '-------------------

    'pluto:2.5.0
    If Criminal(Muerto) Then
        If UserList(atacante).flags.LastCrimMatado <> UserList(Muerto).Name Then
            UserList(atacante).flags.LastCrimMatado = UserList(Muerto).Name
            'pluto:5.2
            UserList(atacante).MuertesTime = UserList(atacante).MuertesTime + 1
            UserList(Muerto).flags.CMuerte = 1

            Call AddtoVar(UserList(atacante).Faccion.CriminalesMatados, 1, 65000)

        End If

        If UserList(atacante).Faccion.CriminalesMatados > MAXUSERMATADOS Then
            UserList(atacante).Faccion.CriminalesMatados = 0
            UserList(atacante).Faccion.RecompensasReal = 0

        End If

    ElseIf UserList(Muerto).Faccion.ArmadaReal = 1 Then

        If UserList(atacante).flags.LastCiudMatado <> UserList(Muerto).Name Then
            UserList(atacante).flags.LastCiudMatado = UserList(Muerto).Name
            'pluto:5.2
            UserList(atacante).MuertesTime = UserList(atacante).MuertesTime + 1
            UserList(Muerto).flags.CMuerte = 1

            Call AddtoVar(UserList(atacante).Faccion.CiudadanosMatados, 1, 65000)

        End If
    

        If UserList(atacante).Faccion.CiudadanosMatados > MAXUSERMATADOS Then
            UserList(atacante).Faccion.CiudadanosMatados = 0
            UserList(atacante).Faccion.RecompensasCaos = 0

        End If
        
        ElseIf UserList(Muerto).Faccion.ArmadaReal = 2 Then
                'If UserList(atacante).flags.LastCiudMatado <> UserList(Muerto).Name Then
            'UserList(atacante).flags.LastCiudMatado = UserList(Muerto).Name
            'pluto:5.2
            'UserList(atacante).MuertesTime = UserList(atacante).MuertesTime + 1
            'UserList(Muerto).flags.CMuerte = 1

            Call AddtoVar(UserList(atacante).Faccion.NeutralesMatados, 1, 65000)

        End If
        
    

        If UserList(atacante).Faccion.NeutralesMatados > MAXUSERMATADOS Then
            UserList(atacante).Faccion.NeutralesMatados = 0

    End If
    
    If UserList(atacante).Faccion.ArmadaReal = 2 Then
    UserList(atacante).Faccion.RecompensasReal = (UserList(atacante).Faccion.CriminalesMatados \ 60) + (UserList(atacante).Faccion.CiudadanosMatados \ 60) + (UserList(atacante).Faccion.NeutralesMatados \ 60)
    End If

    'pluto:2.15
    Call SendUserMuertos(atacante)
    Exit Sub
    'pluto:2.6.0
ErrorHandler:
    Call LogError("Error CONTARMUERTE --> " & Err.number & " D: " & Err.Description & "--> " & UserList( _
                  atacante).Name & " -- " & UserList(Muerto).Name & " Puntosclan: " & UserList(atacante).Stats.PClan & "/" _
                  & UserList(Muerto).Stats.PClan & " Puntos de Canje: " & UserList(atacante).Stats.Puntos & "/" & UserList( _
                  Muerto).Stats.Puntos)

End Sub

Sub Tilelibre(Pos As WorldPos, nPos As WorldPos)

'Call LogTarea("Sub Tilelibre")
    On Error GoTo fallo

    Dim Notfound As Boolean
    Dim loopc As Integer
    Dim tX As Integer
    Dim tY As Integer
    Dim hayobj As Boolean
    hayobj = False
    nPos.Map = Pos.Map

    Do While Not LegalPos(Pos.Map, nPos.X, nPos.Y) Or hayobj

        If loopc > 15 Then
            Notfound = True
            Exit Do

        End If

        For tY = Pos.Y - loopc To Pos.Y + loopc
            For tX = Pos.X - loopc To Pos.X + loopc

                If LegalPos(nPos.Map, tX, tY) = True Then
                    hayobj = (MapData(nPos.Map, tX, tY).OBJInfo.ObjIndex > 0)

                    If Not hayobj And MapData(nPos.Map, tX, tY).TileExit.Map = 0 Then
                        nPos.X = tX
                        nPos.Y = tY
                        tX = Pos.X + loopc
                        tY = Pos.Y + loopc

                    End If

                End If

            Next tX
        Next tY

        loopc = loopc + 1

    Loop

    If Notfound = True Then
        nPos.X = 0
        nPos.Y = 0

    End If

    Exit Sub
fallo:
    Call LogError("tilelibre " & Err.number & " D: " & Err.Description)

End Sub

Sub WarpUserChar(ByVal Userindex As Integer, ByVal Map As Integer, ByVal X As Integer, ByVal Y As Integer, Optional ByVal FX As Boolean = False)

    On Error GoTo fallo

    'pluto:6.5
    'DoEvents

    'Quitar el dialogo
    Dim nPos As WorldPos
    Dim xpos As WorldPos
    Dim X1   As Byte
    Dim Y1   As Byte

    If Userindex = 0 Or Map = 0 Then Exit Sub

    'PLUTO:6.6
    If UserList(Userindex).Char.CharIndex = 0 Then
        Call LogError("Charindex CERO: index: " & Userindex & " Name: " & UserList(Userindex).Name & " Map: " & UserList(Userindex).Pos.Map & " xy: " & UserList(Userindex).Pos.X & " " & UserList(Userindex).Pos.Y)
        Exit Sub

    End If

    'pluto:6.3 aleatorios zonas conflictivas
    'If UserList(UserIndex).flags.Privilegios > 0 Then GoTo Noalea

    'Select Case Map
    'Case 268 To 271
    ' If (X = 40 And Y = 53) Or (X = 43 And Y = 26) Then
    'x1 = RandomNumber(1, 10)
    'Y1 = RandomNumber(1, 10)
    ' X = X + x1
    '  Y = Y + Y1
    '   End If
    'Case 185
    'If Y = 82 Then
    ' X = RandomNumber(37, 64)
    '  Y = RandomNumber(83, 91)
    '   End If
    'Case 140  'veril
    'If Y = 90 Then
    ' X = RandomNumber(48, 57)
    '  Y = RandomNumber(84, 89)
    '   End If
    'Case 141
    '   If Y > 90 Then
    '    X = RandomNumber(40, 49)
    '    Y = RandomNumber(50, 57)
    '    End If
    'Case 48
    '    X = RandomNumber(44, 48)
    '    Y = RandomNumber(53, 57)
    'Case 156
    '   X = RandomNumber(75, 79)
    '    Y = RandomNumber(72, 75)
    'Case 162
    'X = RandomNumber(76, 80)
    'Y = RandomNumber(81, 85)
    'Case 165
    'X = RandomNumber(70, 75)
    'Y = RandomNumber(19, 23)
    'Case 59
    'If Y = 50 Then
    'X = RandomNumber(43, 52)
    'Y = RandomNumber(47, 51)
    'End If
    'Case 166 To 169
    'If Y = 81 Then
    'X = RandomNumber(40, 57)
    'Y = RandomNumber(77, 84)
    'End If
    'Case MAPATORNEO
    'X = RandomNumber(52, 71)
    'Y = RandomNumber(44, 59)
    'Case 291 To 295
    'X = RandomNumber(52, 71)
    'Y = RandomNumber(44, 59)
    'Case MapaTorneo2
    'X = RandomNumber(52, 71)
    'Y = RandomNumber(44, 59)
    'Case 296
    'X = RandomNumber(70, 76)
    'Y = RandomNumber(60, 66)
    'End Select
    '----------------------------------

    'Noalea:
    'pluto:2.18
    'If Map > 267 And Map < 272 And ((x = 40 And Y = 53) Or (x = 43 And Y = 26)) Then

    'x1 = RandomNumber(1, 10)
    'Y1 = RandomNumber(1, 10)
    'x = x + x1
    'Y = Y + Y1
    'End If

    'If Map = 185 And Y = 82 Then
    'x = RandomNumber(37, 64)
    'Y = RandomNumber(83, 91)
    'End If
    '-----------------------
    'pluto:6.4 demonios/angeles en castillos
    If Map = MapaAngel Or (Map > 165 And Map < 170) Or Map = 185 Then

        If UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Demonio > 0 Then
            UserList(Userindex).Stats.MinSta = 0

        End If

    End If

    'pluto:2.18----------------------------
    xpos.Map = Map
    xpos.Y = Y
    xpos.X = X
    Dim aguita As Byte

    If UserList(Userindex).flags.Navegando = 1 Then aguita = 1 Else aguita = 0

    'pluto:6.0A-----------------------------------
    If UserList(Userindex).flags.Privilegios = 0 Then
        Call ClosestLegalPos(xpos, nPos, aguita)
    Else
        nPos.X = X
        nPos.Y = Y

    End If

    '---------------------------------------------
    If nPos.X <> 0 And nPos.Y <> 0 Then    'end if al final
        X = nPos.X
        Y = nPos.Y

        Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 21, UserList(Userindex).Char.CharIndex)

        Call SendData2(ToIndex, Userindex, UserList(Userindex).Pos.Map, 5)

        'pluto:2.7.1
        'If Y > 90 Then Y = Y - 2

        Dim Oldmap As Integer
        Dim OldX   As Integer
        Dim OldY   As Integer

        Oldmap = UserList(Userindex).Pos.Map
        'UserList(UserIndex).flags.MapaIncor = Oldmap
        OldX = UserList(Userindex).Pos.X
        OldY = UserList(Userindex).Pos.Y
        'pluto:2.9.0 ropa futbol
        'If OldMap = 192 And Map <> 192 Then
        'If TieneObjetos(1005, 1, UserIndex) Then
        'Call QuitarObjetos(1005, 10000, UserIndex)
        'End If
        'If TieneObjetos(1006, 1, UserIndex) Then
        'Call QuitarObjetos(1006, 10000, UserIndex)
        'End If
        'If TieneObjetos(1007, 1, UserIndex) Then
        'Call QuitarObjetos(1007, 10000, UserIndex)
        'End If
        'If TieneObjetos(1008, 1, UserIndex) Then
        'Call QuitarObjetos(1008, 10000, UserIndex)
        'End If

        'End If '192

        Call EraseUserCharMismoIndex(Userindex)

        'pluto:6.2-----------------------
        If Oldmap = 291 And UserList(Userindex).flags.ParejaTorneo > 0 Then
            UserList(UserList(Userindex).flags.ParejaTorneo).flags.ParejaTorneo = 0
            UserList(Userindex).flags.ParejaTorneo = 0

        End If

        'pluto:6.8---
        If Oldmap = 292 Then

            If UserList(Userindex).GuildInfo.GuildName = TorneoClan(1).Nombre Then TorneoClan(1).numero = TorneoClan(1).numero - 1

            If UserList(Userindex).GuildInfo.GuildName = TorneoClan(2).Nombre Then TorneoClan(2).numero = TorneoClan(2).numero - 1

        End If

        '---------------
        'If Oldmap = 292 And UserList(UserIndex).flags.Privilegios = 0 Then
        '   If UserList(UserIndex).GuildInfo.GuildName = TorneoClan(1).Nombre Then
        '      TorneoClan(1).Numero = TorneoClan(1).Numero - 1
        '         If TorneoClan(1).Numero = 0 Then
        '        TClanOcupado = TClanOcupado - 1
        '       TorneoClan(1).Nombre = ""
        '      End If
        '   ElseIf UserList(UserIndex).GuildInfo.GuildName = TorneoClan(2).Nombre Then
        '      TorneoClan(2).Numero = TorneoClan(2).Numero - 1
        '         If TorneoClan(2).Numero = 0 Then
        '        TClanOcupado = TClanOcupado - 1
        '       TorneoClan(2).Nombre = ""
        '      End If
        ' End If
        'End If
        '--------------------------
        'pluto:2.19
        'mapa de conquista
        'If MapInfo(Map).Terreno = "CONQUISTA" Then
        'Dim r12
        'Dim y12
        '    r12 = RandomNumber(33, 52)
        ' y12 = RandomNumber(25, 32)
        'UserList(UserIndex).Pos.X = r12
        'UserList(UserIndex).Pos.Y = y12
        'GoTo tt
        'End If
        '---------------------------------------

        UserList(Userindex).Pos.X = X
        UserList(Userindex).Pos.Y = Y
tt:
        UserList(Userindex).Pos.Map = Map

        If Oldmap <> Map Then
            Call SendData2(ToIndex, Userindex, 0, 14, Map & "," & MapInfo(UserList(Userindex).Pos.Map).MapVersion)

            If MapInfo(Map).Terreno = "BOSQUE" Then
                MapInfo(Map).Music = "3-1"
            ElseIf MapInfo(Map).Terreno = "MAR" Then
                MapInfo(Map).Music = "17-1"

            End If

            'pluto:6.0a
            If MapInfo(Map).Music <> MapInfo(Oldmap).Music Then
            'Debug.Print MapInfo(Map).Music
            
                Call SendData(ToIndex, Userindex, 0, "TM" & MapInfo(Map).Music)

            End If

            'Call SendData(ToIndex, UserIndex, 0, "TM" & 25)
            Call MakeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)

            Call SendData(ToIndex, Userindex, 0, "IP" & UserList(Userindex).Char.CharIndex)
            Dim k As Long, Added As Boolean
            
            'Update new Map Users
            If UserList(Userindex).flags.Privilegios < 10 Then
                MapInfo(Map).NumUsers = MapInfo(Map).NumUsers + 1
                Added = True

                ' Chequemoas que en el mapa ya no este el index.
                For k = 1 To MapInfo(Map).Userindex.Count
                    If MapInfo(Map).Userindex.Item(k) = Userindex Then
                        Added = False
                        Exit For
                   End If
                Next k

                If Added Then
                    MapInfo(Map).Userindex.Add Userindex
                End If
            End If

            'Update old Map Users
            If UserList(Userindex).flags.Privilegios < 10 Then
                MapInfo(Oldmap).NumUsers = MapInfo(Oldmap).NumUsers - 1
               
                ' chequemoas que ste el index ene l mapa para borrar.
                For k = 1 To MapInfo(Oldmap).Userindex.Count
                    If MapInfo(Oldmap).Userindex.Item(k) = Userindex Then
                        MapInfo(Oldmap).Userindex.Remove k
                        Exit For
                    End If
                Next k

            End If

            If MapInfo(Oldmap).NumUsers < 0 Then
                MapInfo(Oldmap).NumUsers = 0

            End If

            'pluto:6.0A-------------solidos mapa 274--------------------------
            If Map = 274 Then
                Dim a      As Byte
                'Dim x As Byte
                Dim b      As Byte
                Dim Salida As Byte
                Dim obj    As obj

                If SolidoGirando = 0 Then GoTo nogiraba
                'SolidoGirando = 5
                b = 45 + (SolidoGirando * 2)

                'quitamos al que gira-----------------
                If MapData(Map, b, 26).OBJInfo.ObjIndex = 1170 + SolidoGirando Then
                    Call EraseObj(ToMap, Userindex, Map, 10000, Map, b, 26)
                    obj.Amount = 1
                    obj.ObjIndex = 1175 + SolidoGirando
                    Call MakeObj(ToMap, 0, Map, obj, Map, b, 26)
                    Salida = 6 + (SolidoGirando * 10)
                    MapData(Map, Salida, 11).TileExit.Map = 28
                    MapData(Map, Salida, 11).TileExit.X = 46
                    MapData(Map, Salida, 11).TileExit.Y = 86

                End If

                'fin quitamos girar---------

                'ponemos nuevo solido a girar------------
nogiraba:
                a = RandomNumber(1, 5)
                b = 45 + (a * 2)

                If MapData(Map, b, 26).OBJInfo.ObjIndex = 1175 + a Then
                    Call EraseObj(ToMap, Userindex, Map, 10000, Map, b, 26)
                    obj.Amount = 1
                    obj.ObjIndex = 1170 + a
                    Call MakeObj(ToMap, 0, Map, obj, Map, b, 26)
                    SolidoGirando = a
                    Salida = 6 + (SolidoGirando * 10)
                    MapData(Map, Salida, 11).TileExit.Map = 276
                    MapData(Map, Salida, 11).TileExit.X = 43
                    MapData(Map, Salida, 11).TileExit.Y = 83

                End If

            End If    'mapa 274

            '---------fin solidos------------------------------------------

            'pluto:2.12
            If MapInfo(Oldmap).NumUsers = 0 And Oldmap = MapaTorneo2 Then MinutoSinMorir = 0

            If Oldmap = MapaTorneo2 Then
                UserList(Userindex).Torneo2 = 0
                Torneo2Record = 0
                Call SendData2(ToIndex, Userindex, 0, 96, Torneo2Name & "," & Torneo2Record & "," & TorneoBote)

            End If

            'pluto:6.8 lo coloco aquí sólo cuando es distinto mapa
            Call UpdateUserMap(Userindex)

        Else    'mismo mapa

            Call MakeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)
            Call SendData(ToIndex, Userindex, 0, "IP" & UserList(Userindex).Char.CharIndex)

        End If

        'pluto:6.8 cambio a arriba en distintos mapas
        'Call UpdateUserMap(UserIndex)

        'pluto:2-3-04
        If FX And UserList(Userindex).flags.Privilegios = 0 Then    'FX
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_WARP)
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & FXWARP & "," & 0)

        End If

        '[MerLiNz:X]
        If (UserList(Userindex).flags.Invisible = 1 Or UserList(Userindex).flags.Oculto = 1) And (Not UserList(Userindex).flags.AdminInvisible = 1) Then
            Call SendData2(ToMap, 0, Map, 16, UserList(MapData(Map, X, Y).Userindex).Char.CharIndex & ",1")
            Call SendData2(ToIndex, Userindex, 0, 16, UserList(MapData(Map, X, Y).Userindex).Char.CharIndex & ",1")

        End If

        '[\END]
        'pluto:6.9------------
        'Call EfectoIncor(UserIndex)
        If UserList(Userindex).flags.MapaIncor <> Map Then
            UserList(Userindex).flags.Incor = True
            UserList(Userindex).Counters.Incor = 0

            'UserList(UserIndex).flags.MapaIncor = Oldmap
        End If

        UserList(Userindex).flags.MapaIncor = Oldmap

        'PLUTO:6.3---------------
        If UserList(Userindex).flags.Macreanda > 0 Then
            UserList(Userindex).flags.ComproMacro = 0
            UserList(Userindex).flags.Macreanda = 0
            Call SendData(ToIndex, Userindex, 0, "O3")

        End If

        '--------------------------

        'UserList(UserIndex).flags.Macreanda = 0
        'Call SendData2(ToMap, UserIndex, UserList(UserIndex).Pos.Map, 22, UserList(UserIndex).Char.CharIndex & "," & 61 & "," & 1)
        'UserList(UserIndex).Char.FX = 61
        '-----------------------

        Call WarpMascotas(Userindex)

        'pluto:2.12
        If Map = MapaTorneo2 And UserList(Userindex).flags.Privilegios = 0 And Oldmap <> MapaTorneo2 Then

            If Torneo2Name = "" Then
                Torneo2Name = UserList(Userindex).Name
                Torneo2Record = 0
            End If

            TorneoBote = TorneoBote + 100
            Call SendData2(ToMap, 0, MapaTorneo2, 96, Torneo2Name & "," & Torneo2Record & "," & TorneoBote)

            'Call SendData2(ToIndex, UserIndex, 0, 96, Torneo2Name & "," & Torneo2Record & "," & TorneoBote)
        End If

    End If    'npos<>0

    Exit Sub
fallo:
    Call LogError("WarpUserChar " & Err.number & " D: " & Err.Description)

End Sub

Sub WarpUserChar2(ByVal Userindex As Integer, ByVal Map As Integer, ByVal X As Integer, ByVal Y As Integer, Optional ByVal FX As Boolean = False)

    On Error GoTo fallo

    'Quitar el dialogo
    Dim nPos As WorldPos
    Dim xpos As WorldPos
    Dim X1   As Byte
    Dim Y1   As Byte

    If Userindex = 0 Or Map = 0 Then Exit Sub

    'pluto:6.3 aleatorios zonas conflictivas

    'pluto:6.4
    If Map = MapaAngel Or (Map > 165 And Map < 170) Or Map = 185 Then
        If UserList(Userindex).flags.Angel > 0 Or UserList(Userindex).flags.Demonio > 0 Then
            UserList(Userindex).Stats.MinSta = 0

        End If

    End If

    'pluto:2.18----------------------------
    xpos.Map = Map
    xpos.Y = Y
    xpos.X = X
    Dim aguita As Byte

    If UserList(Userindex).flags.Navegando = 1 Then aguita = 1 Else aguita = 0
    'pluto:6.0A-----------------------------------
    'If UserList(UserIndex).flags.Privilegios = 0 Then
    Call ClosestLegalPos(xpos, nPos, aguita)

    'Else
    'nPos.X = X
    'nPos.Y = Y
    'End If
    '---------------------------------------------
    If nPos.X <> 0 And nPos.Y <> 0 Then    'end if al final
        X = nPos.X
        Y = nPos.Y
        '---------------------------------------
        Call SendData2(ToMap, 0, UserList(Userindex).Pos.Map, 21, UserList(Userindex).Char.CharIndex)

        Call SendData2(ToIndex, Userindex, UserList(Userindex).Pos.Map, 5)

        'pluto:2.7.1
        'If Y > 90 Then Y = Y - 2

        Dim Oldmap As Integer
        Dim OldX   As Integer
        Dim OldY   As Integer

        Oldmap = UserList(Userindex).Pos.Map
        OldX = UserList(Userindex).Pos.X
        OldY = UserList(Userindex).Pos.Y

        Call EraseUserChar(ToMap, 0, Oldmap, Userindex)

        'pluto:6.2-----------------------
        If Oldmap = 291 And UserList(Userindex).flags.ParejaTorneo > 0 Then
            UserList(UserList(Userindex).flags.ParejaTorneo).flags.ParejaTorneo = 0
            UserList(Userindex).flags.ParejaTorneo = 0

        End If

        If Oldmap = 292 And UserList(Userindex).flags.Privilegios = 0 Then
            If UserList(Userindex).GuildInfo.GuildName = TorneoClan(1).Nombre Then
                TorneoClan(1).numero = TorneoClan(1).numero - 1

                If TorneoClan(1).numero = 0 Then
                    TClanOcupado = TClanOcupado - 1
                    TorneoClan(1).Nombre = ""

                End If

            ElseIf UserList(Userindex).GuildInfo.GuildName = TorneoClan(2).Nombre Then
                TorneoClan(2).numero = TorneoClan(2).numero - 1

                If TorneoClan(2).numero = 0 Then
                    TClanOcupado = TClanOcupado - 1
                    TorneoClan(2).Nombre = ""

                End If

            End If

        End If

        UserList(Userindex).Pos.X = X
        UserList(Userindex).Pos.Y = Y
tt:
        UserList(Userindex).Pos.Map = Map

        If Oldmap <> Map Then
            Call SendData2(ToIndex, Userindex, 0, 14, Map & "," & MapInfo(UserList(Userindex).Pos.Map).MapVersion)

            If MapInfo(Map).Terreno = "BOSQUE" Then
                MapInfo(Map).Music = "3-1"
            ElseIf MapInfo(Map).Terreno = "MAR" Then
                MapInfo(Map).Music = "17-1"

            End If

            'pluto:6.0a
            If MapInfo(Map).Music <> MapInfo(Oldmap).Music Then
                Call SendData(ToIndex, Userindex, 0, "TM" & MapInfo(Map).Music)

            End If

            'Call SendData(ToIndex, UserIndex, 0, "TM" & 25)
            Call MakeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)

            Call SendData(ToIndex, Userindex, 0, "IP" & UserList(Userindex).Char.CharIndex)
            
            Dim k As Long, Added As Boolean
            'Update new Map Users
            If UserList(Userindex).flags.Privilegios = 0 Then
                MapInfo(Map).NumUsers = MapInfo(Map).NumUsers + 1
                
                ' Chequemoas que en el mapa ya no este el index.
                For k = 1 To MapInfo(Map).Userindex.Count
                    If MapInfo(Map).Userindex.Item(k) = Userindex Then
                        Added = False
                        Exit For
                    End If
                Next k

                If Added Then
                    MapInfo(Map).Userindex.Add Userindex
                End If
            End If

            'Update old Map Users
            If UserList(Userindex).flags.Privilegios = 0 Then
                MapInfo(Oldmap).NumUsers = MapInfo(Oldmap).NumUsers - 1
               
                ' chequemoas que ste el index ene l mapa para borrar.
                For k = 1 To MapInfo(Oldmap).Userindex.Count
                    If MapInfo(Oldmap).Userindex.Item(k) = Userindex Then
                        MapInfo(Oldmap).Userindex.Remove k
                        Exit For
                    End If
                Next k

            End If

            If MapInfo(Oldmap).NumUsers < 0 Then
                MapInfo(Oldmap).NumUsers = 0

            End If

            'pluto:6.0A-------------solidos mapa 274--------------------------
            If Map = 274 Then
                Dim a      As Byte
                'Dim x As Byte
                Dim b      As Byte
                Dim Salida As Byte
                Dim obj    As obj

                If SolidoGirando = 0 Then GoTo nogiraba
                'SolidoGirando = 5
                b = 45 + (SolidoGirando * 2)

                'quitamos al que gira-----------------
                If MapData(Map, b, 26).OBJInfo.ObjIndex = 1170 + SolidoGirando Then
                    Call EraseObj(ToMap, Userindex, Map, 10000, Map, b, 26)
                    obj.Amount = 1
                    obj.ObjIndex = 1175 + SolidoGirando
                    Call MakeObj(ToMap, 0, Map, obj, Map, b, 26)
                    Salida = 6 + (SolidoGirando * 10)
                    MapData(Map, Salida, 11).TileExit.Map = 28
                    MapData(Map, Salida, 11).TileExit.X = 46
                    MapData(Map, Salida, 11).TileExit.Y = 86

                End If

                'fin quitamos girar---------

                'ponemos nuevo solido a girar------------
nogiraba:
                a = RandomNumber(1, 5)
                b = 45 + (a * 2)

                If MapData(Map, b, 26).OBJInfo.ObjIndex = 1175 + a Then
                    Call EraseObj(ToMap, Userindex, Map, 10000, Map, b, 26)
                    obj.Amount = 1
                    obj.ObjIndex = 1170 + a
                    Call MakeObj(ToMap, 0, Map, obj, Map, b, 26)
                    SolidoGirando = a
                    Salida = 6 + (SolidoGirando * 10)
                    MapData(Map, Salida, 11).TileExit.Map = 276
                    MapData(Map, Salida, 11).TileExit.X = 43
                    MapData(Map, Salida, 11).TileExit.Y = 83

                End If

            End If    'mapa 274

            '---------fin solidos------------------------------------------

            'pluto:2.12
            If MapInfo(Oldmap).NumUsers = 0 And Oldmap = MapaTorneo2 Then MinutoSinMorir = 0
            If Oldmap = MapaTorneo2 Then
                UserList(Userindex).Torneo2 = 0
                Torneo2Record = 0
                Call SendData2(ToIndex, Userindex, 0, 96, Torneo2Name & "," & Torneo2Record & "," & TorneoBote)

            End If

        Else    'mismo mapa

            Call MakeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)
            Call SendData(ToIndex, Userindex, 0, "IP" & UserList(Userindex).Char.CharIndex)

        End If

        Call UpdateUserMap(Userindex)

        'pluto:2-3-04
        If FX And UserList(Userindex).flags.Privilegios = 0 Then    'FX
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_WARP)
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & FXWARP & "," & 0)

        End If

        '[MerLiNz:X]
        If (UserList(Userindex).flags.Invisible = 1 Or UserList(Userindex).flags.Oculto = 1) And (Not UserList(Userindex).flags.AdminInvisible = 1) Then
            Call SendData2(ToMap, 0, Map, 16, UserList(MapData(Map, X, Y).Userindex).Char.CharIndex & ",1")
            Call SendData2(ToIndex, Userindex, 0, 16, UserList(MapData(Map, X, Y).Userindex).Char.CharIndex & ",1")

        End If

        '[\END]
        'pluto:6.2------------
        'Call EfectoIncor(UserIndex)
        UserList(Userindex).flags.Incor = True
        UserList(Userindex).Counters.Incor = 0

        'PLUTO:6.3---------------
        If UserList(Userindex).flags.Macreanda > 0 Then
            UserList(Userindex).flags.ComproMacro = 0
            UserList(Userindex).flags.Macreanda = 0
            Call SendData(ToIndex, Userindex, 0, "O3")

        End If

        '--------------------------

        'UserList(UserIndex).flags.Macreanda = 0
        'Call SendData2(ToMap, UserIndex, UserList(UserIndex).Pos.Map, 22, UserList(UserIndex).Char.CharIndex & "," & 61 & "," & 1)
        'UserList(UserIndex).Char.FX = 61
        '-----------------------

        Call WarpMascotas(Userindex)

        'pluto:2.12
        If Map = MapaTorneo2 And UserList(Userindex).flags.Privilegios = 0 And Oldmap <> MapaTorneo2 Then
            If Torneo2Name = "" Then
                Torneo2Name = UserList(Userindex).Name
                Torneo2Record = 0
            End If

            TorneoBote = TorneoBote + 100
            Call SendData2(ToMap, 0, MapaTorneo2, 96, Torneo2Name & "," & Torneo2Record & "," & TorneoBote)

            'Call SendData2(ToIndex, UserIndex, 0, 96, Torneo2Name & "," & Torneo2Record & "," & TorneoBote)
        End If

    End If    'npos<>0

    Exit Sub
fallo:
    Call LogError("WarpUserChar2 " & Err.number & " D: " & Err.Description)

End Sub

Sub WarpMascotas(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim i As Integer

    Dim UMascRespawn As Boolean
    Dim miflag As Byte, MascotasReales As Integer
    Dim prevMacotaType As Integer

    Dim PetTypes(1 To MAXMASCOTAS) As Integer
    Dim PetRespawn(1 To MAXMASCOTAS) As Boolean
    Dim PetTiempoDeVida(1 To MAXMASCOTAS) As Integer

    Dim NroPets As Integer
    Dim InvocadosMatados As Integer
    
    If NumUsers = 0 Then Exit Sub

    NroPets = UserList(Userindex).NroMacotas
    InvocadosMatados = 0

    'Miqueas
    'Matamos los invocados
    '[Alejo 18-03-2004]
    For i = 1 To MAXMASCOTAS

        If UserList(Userindex).MascotasIndex(i) > 0 Then

            ' si la mascota tiene tiempo de vida > 0 significa q fue invocada.
            If Npclist(UserList(Userindex).MascotasIndex(i)).Contadores.TiempoExistencia > 0 Then
                Call QuitarNPC(UserList(Userindex).MascotasIndex(i))
                UserList(Userindex).MascotasIndex(i) = 0
                InvocadosMatados = InvocadosMatados + 1
                NroPets = NroPets - 1

            End If

        End If

    Next i

    If InvocadosMatados > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||Pierdes el control de tus mascotas." & "´" & FONTTYPE_INFO)

    End If

    For i = 1 To MAXMASCOTAS

        If UserList(Userindex).MascotasIndex(i) > 0 Then
            PetRespawn(i) = Npclist(UserList(Userindex).MascotasIndex(i)).flags.Respawn = 0
            PetTypes(i) = UserList(Userindex).MascotasType(i)
            PetTiempoDeVida(i) = Npclist(UserList(Userindex).MascotasIndex(i)).Contadores.TiempoExistencia
            Call QuitarNPC(UserList(Userindex).MascotasIndex(i))

        End If

    Next i

    For i = 1 To MAXMASCOTAS

        If PetTypes(i) > 0 Then
            UserList(Userindex).MascotasIndex(i) = SpawnNpc(PetTypes(i), UserList(Userindex).Pos, False, PetRespawn(i))
            UserList(Userindex).MascotasType(i) = PetTypes(i)

            'Controlamos que se sumoneo OK
            If UserList(Userindex).MascotasIndex(i) = MAXNPCS Then
                UserList(Userindex).MascotasIndex(i) = 0
                UserList(Userindex).MascotasType(i) = 0

                If UserList(Userindex).NroMacotas > 0 Then UserList(Userindex).NroMacotas = UserList( _
                   Userindex).NroMacotas - 1
                Exit Sub

            End If

            Npclist(UserList(Userindex).MascotasIndex(i)).MaestroUser = Userindex
            Npclist(UserList(Userindex).MascotasIndex(i)).Movement = SIGUE_AMO
            Npclist(UserList(Userindex).MascotasIndex(i)).Target = 0
            Npclist(UserList(Userindex).MascotasIndex(i)).TargetNpc = 0
            Npclist(UserList(Userindex).MascotasIndex(i)).Contadores.TiempoExistencia = PetTiempoDeVida(i)

            'pluto:6.0A
            If MapInfo(UserList(Userindex).Pos.Map).Mascotas = 1 Then
                If Npclist(UserList(Userindex).MascotasIndex(i)).NPCtype <> 60 Then Npclist(UserList( _
                                                                                            Userindex).MascotasIndex(i)).Contadores.TiempoExistencia = 1

            End If

            Call FollowAmo(UserList(Userindex).MascotasIndex(i))

        End If

    Next i

    UserList(Userindex).NroMacotas = NroPets

    Exit Sub
fallo:
    Call LogError("warpmascotas " & Err.number & " D: " & Err.Description)

End Sub

Sub RepararMascotas(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim i As Integer
    Dim MascotasReales As Integer

    For i = 1 To MAXMASCOTAS

        If UserList(Userindex).MascotasType(i) > 0 Then MascotasReales = MascotasReales + 1
    Next i

    If MascotasReales <> UserList(Userindex).NroMacotas Then UserList(Userindex).NroMacotas = 0
    Exit Sub
fallo:
    Call LogError("repararmascotas " & Err.number & " D: " & Err.Description)

End Sub

Sub Cerrar_Usuario(ByVal Userindex As Integer, Optional ByVal Tiempo As Integer = -1)
    Call CloseUser(Userindex)
    CloseSocket (Userindex)
    Exit Sub

    If Tiempo = -1 Then Tiempo = IntervaloCerrarConexion

    If UserList(Userindex).flags.UserLogged And Not UserList(Userindex).Counters.Saliendo Then
        UserList(Userindex).Counters.Saliendo = True
        UserList(Userindex).Counters.Salir = IIf(UserList(Userindex).flags.Privilegios > 0 Or Not MapInfo(UserList( _
                                                                                                          Userindex).Pos.Map).Pk, 0, Tiempo)

        Call SendData(ToIndex, Userindex, 0, "||Cerrando...Se cerrará el juego en " & UserList( _
                                             Userindex).Counters.Salir & " segundos..." & "´" & FontTypeNames.FONTTYPE_INFO)

        'ElseIf Not UserList(UserIndex).Counters.Saliendo Then
        '    If NumUsers <> 0 Then NumUsers = NumUsers - 1
        '    Call SendData(ToIndex, UserIndex, 0, "||Gracias por jugar Argentum Online" & FONTTYPENAMES.FONTTYPE_INFO)
        '    Call SendData(ToIndex, UserIndex, 0, "FINOK")
        '
        '    Call CloseUser(UserIndex)
        '    UserList(UserIndex).ConnID = -1: UserList(UserIndex).NumeroPaquetesPorMiliSec = 0
        '    frmMain.Socket2(UserIndex).Cleanup
        '    Unload frmMain.Socket2(UserIndex)
        '    Call ResetUserSlot(UserIndex)

    End If
     'ejmito
    If UserList(Userindex).Pos.Map = 212 Then
    If UserList(RetoDoble.Jugador1).Counters.Saliendo = True Or UserList(RetoDoble.Jugador2).Counters.Saliendo = True Then
    Call CerroElPrimer
    End If
    If UserList(RetoDoble.Jugador3).Counters.Saliendo = True Or UserList(RetoDoble.Jugador4).Counters.Saliendo = True Then
    Call CerroElSegundo
    End If
    End If

End Sub

Sub ACEPTARETO(ByVal Userindex As Integer, ByVal Tindex As Integer)
 
If Tindex <= 0 Then     'usuario Offline
         Call SendData(ToIndex, Userindex, 0, "||Usuario offline" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
 If MapInfo(207).NumUsers = 1 Then
         Call SendData(ToIndex, Userindex, 0, "||El Ganador Esta Recogiendo sus items, espera 10 segundos." & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If UserList(Userindex).flags.Muerto = 1 Then  'tu estas muerto
         Call SendData(ToIndex, Userindex, 0, "||Estas muerto" & "´" & FONTTYPE_EJECUCION)
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
 
If MapInfo(207).NumUsers = 2 Then
         Call SendData(ToIndex, Userindex, 0, "||Sala de reto ocupada." & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If UserList(Tindex).Pos.Map = 207 Then
         Call SendData(ToIndex, Userindex, 0, "||Esta ocupado" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If Not UserList(Userindex).Pos.Map = 34 Then
         Call SendData(ToIndex, Userindex, 0, "||Solo puedes Aceptar reto desde Ullathorpe" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If Not UserList(Tindex).Pos.Map = 34 Then
         Call SendData(ToIndex, Userindex, 0, "||Tu enemigo no se encuentra en Ullathorpe" & "´" & FONTTYPE_EJECUCION)
         Exit Sub
End If
 
If UserList(Tindex).flags.SuPareja = Userindex Then
             Pareja.Jugador1 = Userindex
             Pareja.Jugador2 = Tindex
             UserList(Pareja.Jugador1).flags.EnPareja = True
             UserList(Pareja.Jugador2).flags.EnPareja = True
             
AntesRetoMap1 = UserList(Pareja.Jugador1).Pos.Map
AntesRetoX1 = UserList(Pareja.Jugador1).Pos.X
AntesRetoY1 = UserList(Pareja.Jugador1).Pos.Y
AntesRetoMap2 = UserList(Pareja.Jugador2).Pos.Map
AntesRetoX2 = UserList(Pareja.Jugador2).Pos.X
AntesRetoY2 = UserList(Pareja.Jugador2).Pos.Y
 
             Call WarpUserChar(Pareja.Jugador1, 207, 46, 44)
             Call WarpUserChar(Pareja.Jugador2, 207, 46, 59)
             Call SendData2(ToIndex, Pareja.Jugador1, 0, 19)
             Call SendData2(ToIndex, Pareja.Jugador2, 0, 19)
             Conteo1 = True
             Cuenta1 = 6
Call SendData(ToIndex, Userindex, 0, "||RETO > " & UserList(Userindex).Name & " y " & UserList(Tindex).Name & " ingresaron a la sala de reto" & "´" & FONTTYPE_EJECUCION)
Call SendData(ToIndex, Tindex, 0, "||RETO > " & UserList(Userindex).Name & " y " & UserList(Tindex).Name & " ingresaron a la sala de reto" & "´" & FONTTYPE_EJECUCION)
'pepe
 
UserList(Pareja.Jugador1).Stats.GLD = UserList(Pareja.Jugador1).Stats.GLD - Pareja.oro
UserList(Pareja.Jugador2).Stats.GLD = UserList(Pareja.Jugador2).Stats.GLD - Pareja.oro
Call senduserstatsbox(Pareja.Jugador1)
Call senduserstatsbox(Pareja.Jugador2)
End If
         Exit Sub
End Sub
 
Sub TodoRETO()
If UserList(Pareja.Jugador1).flags.Muerto = 1 Then
Call WarpUserChar(Pareja.Jugador1, AntesRetoMap1, AntesRetoX1, AntesRetoY1)
Call WarpUserChar(Pareja.Jugador2, AntesRetoMap2, AntesRetoX2, AntesRetoY2)
UserList(Pareja.Jugador1).flags.SuPareja = 0
UserList(Pareja.Jugador1).flags.EsperaPareja = 0
UserList(Pareja.Jugador1).flags.EnPareja = 0
UserList(Pareja.Jugador2).flags.SuPareja = 0
UserList(Pareja.Jugador2).flags.EsperaPareja = 0
UserList(Pareja.Jugador2).flags.EnPareja = 0
Call SendData(ToAll, 0, 0, "||RETO > " & UserList(Pareja.Jugador2).Name & " Vs. " & UserList(Pareja.Jugador1).Name & ". Ganador " & UserList(Pareja.Jugador2).Name & ". Apuesta " & Pareja.oro & " Monedas de oro." & "´" & FONTTYPE_EJECUCION)
 
    'UserList(Pareja.Jugador2).Stats.Puntos = UserList(Pareja.Jugador2).Stats.Puntos + 5
    'Call SendData(ToIndex, Pareja.Jugador2, 0, "||Se te han sumado 5 puntos de canjes por la victoria en el duelo a muerte!!." & FONTTYPE_INFO)
 
'UserList(Pareja.Jugador2).Stats.RetosGanados = UserList(Pareja.Jugador2).Stats.RetosGanados + 1
'UserList(Pareja.Jugador1).Stats.RetosPerdidos = UserList(Pareja.Jugador1).Stats.RetosPerdidos + 1
UserList(Pareja.Jugador2).Stats.GLD = UserList(Pareja.Jugador2).Stats.GLD + (Pareja.oro * 2)
Call senduserstatsbox(Pareja.Jugador2)
End If
If UserList(Pareja.Jugador2).flags.Muerto = 1 Then
Call WarpUserChar(Pareja.Jugador1, AntesRetoMap1, AntesRetoX1, AntesRetoY1)
Call WarpUserChar(Pareja.Jugador2, AntesRetoMap2, AntesRetoX2, AntesRetoY2)
UserList(Pareja.Jugador1).flags.SuPareja = 0
UserList(Pareja.Jugador1).flags.EsperaPareja = 0
UserList(Pareja.Jugador1).flags.EnPareja = 0
UserList(Pareja.Jugador2).flags.SuPareja = 0
UserList(Pareja.Jugador2).flags.EsperaPareja = 0
UserList(Pareja.Jugador2).flags.EnPareja = 0
Call SendData(ToAll, 0, 0, "||RETO > " & UserList(Pareja.Jugador1).Name & " Vs. " & UserList(Pareja.Jugador2).Name & ". Ganador " & UserList(Pareja.Jugador1).Name & ". Apuesta " & Pareja.oro & " Monedas de oro." & "´" & FONTTYPE_EJECUCION)
 
    'UserList(Pareja.Jugador1).Stats.Puntos = UserList(Pareja.Jugador1).Stats.Puntos + 5
    'Call SendData(ToIndex, Pareja.Jugador1, 0, "||Se te han sumado 5 puntos de canjes por la victoria en el duelo a muerte!!." & FONTTYPE_INFO)
    
'UserList(Pareja.Jugador1).Stats.RetosGanados = UserList(Pareja.Jugador1).Stats.RetosGanados + 1
'UserList(Pareja.Jugador2).Stats.RetosPerdidos = UserList(Pareja.Jugador2).Stats.RetosPerdidos + 1
UserList(Pareja.Jugador1).Stats.GLD = UserList(Pareja.Jugador1).Stats.GLD + (Pareja.oro * 2)
Call senduserstatsbox(Pareja.Jugador1)
End If
End Sub
 
'/////////////////////////////////// RETO 2 VS 2 ////////////////////////////////
Sub RetoDoblee()
If UserList(RetoDoble.Jugador2).flags.AceptoDoble = True And UserList(RetoDoble.Jugador3).flags.AceptoDoble = True And UserList(RetoDoble.Jugador4).flags.AceptoDoble = True Then
 
Reto1X = UserList(RetoDoble.Jugador1).Pos.X
Reto1Y = UserList(RetoDoble.Jugador1).Pos.Y
Reto2X = UserList(RetoDoble.Jugador2).Pos.X
Reto2Y = UserList(RetoDoble.Jugador2).Pos.Y
Reto3X = UserList(RetoDoble.Jugador3).Pos.X
Reto3Y = UserList(RetoDoble.Jugador3).Pos.Y
Reto4X = UserList(RetoDoble.Jugador4).Pos.X
Reto4Y = UserList(RetoDoble.Jugador4).Pos.Y
 
Call SendData2(ToIndex, RetoDoble.Jugador1, 0, 19)
Call SendData2(ToIndex, RetoDoble.Jugador2, 0, 19)
Call SendData2(ToIndex, RetoDoble.Jugador3, 0, 19)
Call SendData2(ToIndex, RetoDoble.Jugador4, 0, 19)
Call WarpUserChar(RetoDoble.Jugador1, 206, 45, 44)
Call WarpUserChar(RetoDoble.Jugador2, 206, 47, 44)
Call WarpUserChar(RetoDoble.Jugador3, 206, 45, 59)
Call WarpUserChar(RetoDoble.Jugador4, 206, 47, 59)
Conteo = True
Cuenta2 = 6
Call SendData(ToIndex, RetoDoble.Jugador1, 0, "||Has ingresado a la sala de reto." & "´" & FONTTYPE_EJECUCION)
Call SendData(ToIndex, RetoDoble.Jugador2, 0, "||Has ingresado a la sala de reto." & "´" & FONTTYPE_EJECUCION)
Call SendData(ToIndex, RetoDoble.Jugador3, 0, "||Has ingresado a la sala de reto." & "´" & FONTTYPE_EJECUCION)
Call SendData(ToIndex, RetoDoble.Jugador4, 0, "||Has ingresado a la sala de reto." & "´" & FONTTYPE_EJECUCION)
UserList(RetoDoble.Jugador1).Stats.GLD = UserList(RetoDoble.Jugador1).Stats.GLD - RetoDoble.oro
UserList(RetoDoble.Jugador2).Stats.GLD = UserList(RetoDoble.Jugador2).Stats.GLD - RetoDoble.oro
UserList(RetoDoble.Jugador3).Stats.GLD = UserList(RetoDoble.Jugador3).Stats.GLD - RetoDoble.oro
UserList(RetoDoble.Jugador4).Stats.GLD = UserList(RetoDoble.Jugador4).Stats.GLD - RetoDoble.oro
Call senduserstatsbox(RetoDoble.Jugador1)
Call senduserstatsbox(RetoDoble.Jugador2)
Call senduserstatsbox(RetoDoble.Jugador3)
Call senduserstatsbox(RetoDoble.Jugador4)
RetoDisponible = False
End If
End Sub
 
Sub BaseRetoDoble()
If UserList(RetoDoble.Jugador1).flags.Muerto = 1 Then
Call WarpUserChar(RetoDoble.Jugador1, 206, 44, 63)
Call PerdioPrimero
Call PerdioSegundo
ElseIf UserList(RetoDoble.Jugador2).flags.Muerto = 1 Then
Call WarpUserChar(RetoDoble.Jugador2, 206, 45, 63)
Call PerdioPrimero
Call PerdioSegundo
ElseIf UserList(RetoDoble.Jugador3).flags.Muerto = 1 Then
Call WarpUserChar(RetoDoble.Jugador3, 206, 46, 63)
Call PerdioPrimero
Call PerdioSegundo
ElseIf UserList(RetoDoble.Jugador4).flags.Muerto = 1 Then
Call WarpUserChar(RetoDoble.Jugador4, 206, 47, 63)
Call PerdioPrimero
Call PerdioSegundo
End If
End Sub
 
Sub PerdioPrimero()
If UserList(RetoDoble.Jugador1).flags.Muerto = 1 And UserList(RetoDoble.Jugador2).flags.Muerto = 1 Then
Call WarpUserChar(RetoDoble.Jugador1, 34, Reto1X, Reto1Y)
Call WarpUserChar(RetoDoble.Jugador2, 34, Reto2X, Reto2Y)
Call WarpUserChar(RetoDoble.Jugador3, 34, Reto3X, Reto3Y)
Call WarpUserChar(RetoDoble.Jugador4, 34, Reto4X, Reto4Y)
 
UserList(RetoDoble.Jugador3).Stats.GLD = UserList(RetoDoble.Jugador3).Stats.GLD + (RetoDoble.oro + RetoDoble.oro)
UserList(RetoDoble.Jugador4).Stats.GLD = UserList(RetoDoble.Jugador4).Stats.GLD + (RetoDoble.oro + RetoDoble.oro)
Call senduserstatsbox(RetoDoble.Jugador3)
Call senduserstatsbox(RetoDoble.Jugador4)
 
UserList(RetoDoble.Jugador1).flags.AceptoDoble = False
UserList(RetoDoble.Jugador2).flags.AceptoDoble = False
UserList(RetoDoble.Jugador3).flags.AceptoDoble = False
UserList(RetoDoble.Jugador4).flags.AceptoDoble = False
 
RetoDisponible = False
 
Call SendData(ToAll, 0, 0, "||RETO > " & UserList(RetoDoble.Jugador1).Name & " y " & UserList(RetoDoble.Jugador2).Name & " Vs. " & UserList(RetoDoble.Jugador3).Name & " y " & UserList(RetoDoble.Jugador4).Name & ". Ganador el equipo de " & UserList(RetoDoble.Jugador3).Name & " y " & UserList(RetoDoble.Jugador4).Name & ". Apuesta " & RetoDoble.oro & " Monedas de oro." & "´" & FONTTYPE_EJECUCION)
 
End If
End Sub
 
Sub PerdioSegundo()
If UserList(RetoDoble.Jugador3).flags.Muerto = 1 And UserList(RetoDoble.Jugador4).flags.Muerto = 1 Then
Call WarpUserChar(RetoDoble.Jugador1, 34, Reto1X, Reto1Y)
Call WarpUserChar(RetoDoble.Jugador2, 34, Reto2X, Reto2Y)
Call WarpUserChar(RetoDoble.Jugador3, 34, Reto3X, Reto3Y)
Call WarpUserChar(RetoDoble.Jugador4, 34, Reto4X, Reto4Y)
 
UserList(RetoDoble.Jugador1).Stats.GLD = UserList(RetoDoble.Jugador1).Stats.GLD + (RetoDoble.oro + RetoDoble.oro)
UserList(RetoDoble.Jugador2).Stats.GLD = UserList(RetoDoble.Jugador2).Stats.GLD + (RetoDoble.oro + RetoDoble.oro)
Call senduserstatsbox(RetoDoble.Jugador1)
Call senduserstatsbox(RetoDoble.Jugador2)
 
UserList(RetoDoble.Jugador1).flags.AceptoDoble = False
UserList(RetoDoble.Jugador2).flags.AceptoDoble = False
UserList(RetoDoble.Jugador3).flags.AceptoDoble = False
UserList(RetoDoble.Jugador4).flags.AceptoDoble = False
 
RetoDisponible = False
 
Call SendData(ToAll, 0, 0, "||RETO > " & UserList(RetoDoble.Jugador1).Name & " y " & UserList(RetoDoble.Jugador2).Name & " Vs. " & UserList(RetoDoble.Jugador3).Name & " y " & UserList(RetoDoble.Jugador4).Name & ". Ganador el equipo de " & UserList(RetoDoble.Jugador1).Name & " y " & UserList(RetoDoble.Jugador2).Name & ". Apuesta " & RetoDoble.oro & " Monedas de oro." & "´" & FONTTYPE_EJECUCION)
 
End If
End Sub
 
Sub CerroElPrimer()
Call WarpUserChar(RetoDoble.Jugador1, 34, Reto1X, Reto1Y)
Call WarpUserChar(RetoDoble.Jugador2, 34, Reto2X, Reto2Y)
Call WarpUserChar(RetoDoble.Jugador3, 34, Reto3X, Reto3Y)
Call WarpUserChar(RetoDoble.Jugador4, 34, Reto4X, Reto4Y)
 
UserList(RetoDoble.Jugador3).Stats.GLD = UserList(RetoDoble.Jugador3).Stats.GLD + (RetoDoble.oro + RetoDoble.oro)
UserList(RetoDoble.Jugador4).Stats.GLD = UserList(RetoDoble.Jugador4).Stats.GLD + (RetoDoble.oro + RetoDoble.oro)
Call senduserstatsbox(RetoDoble.Jugador3)
Call senduserstatsbox(RetoDoble.Jugador4)
 
UserList(RetoDoble.Jugador1).flags.AceptoDoble = False
UserList(RetoDoble.Jugador2).flags.AceptoDoble = False
UserList(RetoDoble.Jugador3).flags.AceptoDoble = False
UserList(RetoDoble.Jugador4).flags.AceptoDoble = False
 
RetoDisponible = False
 
Call SendData(ToAll, 0, 0, "||RETO > " & UserList(RetoDoble.Jugador1).Name & " y " & UserList(RetoDoble.Jugador2).Name & " Vs. " & UserList(RetoDoble.Jugador3).Name & " y " & UserList(RetoDoble.Jugador4).Name & ". Ganador el equipo de " & UserList(RetoDoble.Jugador3).Name & " y " & UserList(RetoDoble.Jugador4).Name & ". Apuesta " & RetoDoble.oro & " Monedas de oro." & "´" & FONTTYPE_EJECUCION)
End Sub
 
Sub CerroElSegundo()
Call WarpUserChar(RetoDoble.Jugador1, 34, Reto1X, Reto1Y)
Call WarpUserChar(RetoDoble.Jugador2, 34, Reto2X, Reto2Y)
Call WarpUserChar(RetoDoble.Jugador3, 34, Reto3X, Reto3Y)
Call WarpUserChar(RetoDoble.Jugador4, 34, Reto4X, Reto4Y)
 
UserList(RetoDoble.Jugador1).Stats.GLD = UserList(RetoDoble.Jugador1).Stats.GLD + (RetoDoble.oro + RetoDoble.oro)
UserList(RetoDoble.Jugador2).Stats.GLD = UserList(RetoDoble.Jugador2).Stats.GLD + (RetoDoble.oro + RetoDoble.oro)
Call senduserstatsbox(RetoDoble.Jugador1)
Call senduserstatsbox(RetoDoble.Jugador2)
 
UserList(RetoDoble.Jugador1).flags.AceptoDoble = False
UserList(RetoDoble.Jugador2).flags.AceptoDoble = False
UserList(RetoDoble.Jugador3).flags.AceptoDoble = False
UserList(RetoDoble.Jugador4).flags.AceptoDoble = False
 
RetoDisponible = False
 
Call SendData(ToAll, 0, 0, "||RETO > " & UserList(RetoDoble.Jugador1).Name & " y " & UserList(RetoDoble.Jugador2).Name & " Vs. " & UserList(RetoDoble.Jugador3).Name & " y " & UserList(RetoDoble.Jugador4).Name & ". Ganador el equipo de " & UserList(RetoDoble.Jugador1).Name & " y " & UserList(RetoDoble.Jugador2).Name & ". Apuesta " & RetoDoble.oro & " Monedas de oro." & "´" & FONTTYPE_EJECUCION)
 
End Sub

Public Function PuedeEntrarACastillo(ByVal Userindex As Integer, ByVal GuildName As String, ByVal Mapa As Integer) As Boolean

    PuedeEntrarACastillo = False
    
    Dim n     As Long
    Dim tInt  As Integer
    Dim Limit As Long

    For n = 1 To MapInfo(Mapa).Userindex.Count

        If GuildName = UserList(MapInfo(Mapa).Userindex.Item(n)).GuildInfo.GuildName Then
            tInt = tInt + 1

        End If

    Next n

    ' 1: 3 usuarios
    ' 2: 4 usuarios
    ' 3: 5 usuarios
    ' 4: 6 usuarios
    ' 5: 7 usuarios
    ' 6: 8 usuarios
    Select Case UserList(Userindex).GuildRef.Nivel
    
        Case 1
            Limit = 3

        Case 2
            Limit = 4

        Case 3
            Limit = 5

        Case 4
            Limit = 6

        Case 5
            Limit = 7

        Case 6
            Limit = 8
            
        Case Else
            Limit = 3

    End Select
    
    PuedeEntrarACastillo = (tInt <= Limit)

End Function

Public Function GetUserRankString(ByVal Userindex As Integer) As String
  
    Dim Rank As String

    Select Case UserList(Userindex).Stats.Elo

        Case 0 To 300
            Rank = "BRONCE"

        Case 301 To 600
            Rank = "PLATA"

        Case 601 To 900
            Rank = "ORO"

        Case 901 To 1200
            Rank = "PLATINO"
        
        Case Else
            Rank = "DIAMANTE"
    
    End Select

    GetUserRankString = Rank

End Function

Public Function GetUserRank(ByVal Userindex As Integer) As eRank
    
    Dim Rank As eRank
    
    Select Case UserList(Userindex).Stats.Elo

        Case 0 To 300
            Rank = eRank.e_BRONCE

        Case 301 To 600
            Rank = eRank.e_PLATA

        Case 601 To 900
            Rank = eRank.e_ORO

        Case 901 To 1200
            Rank = eRank.e_PLATINO
        
        Case Else
            Rank = eRank.e_DIAMANTE

    End Select

    GetUserRank = Rank

End Function


