Attribute VB_Name = "Extra"
Option Explicit

Public Function EsNewbie(ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    EsNewbie = UserList(Userindex).Stats.ELV <= LimiteNewbie

    Exit Function
fallo:
    Call LogError("ESNEWBIE" & Err.number & " D: " & Err.Description)

End Function

Public Sub ControlaSalidas(ByVal Userindex As Integer, ByVal Map As Integer, ByVal X As Integer, ByVal Y As Integer)

    On Error GoTo errhandler

    Dim nPos   As WorldPos
    Dim FxFlag As Boolean

    'Controla las salidas
    If InMapBounds(Map, X, Y) Then
        'pluto.6.5
        'DoEvents

        'pluto:6.0A
        If UserList(Userindex).Pos.Map = 274 And UserList(Userindex).Pos.X = 42 And UserList(Userindex).Pos.Y = 46 Then

            If UserList(Userindex).flags.Pitag = 1 Then
                MapData(Map, X, Y).TileExit.Map = 274
                MapData(Map, X, Y).TileExit.X = 49
                MapData(Map, X, Y).TileExit.Y = 33
            Else
                MapData(Map, X, Y).TileExit.Map = 28
                MapData(Map, X, Y).TileExit.X = 46
                MapData(Map, X, Y).TileExit.Y = 86

            End If

        End If

        If MapData(Map, X, Y).OBJInfo.ObjIndex > 0 Then
            FxFlag = ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).OBJType = OBJTYPE_teleport

        End If

        If MapData(Map, X, Y).TileExit.Map > 0 Then

            'pluto:2.12
            If UserList(Userindex).Pos.Map = MapaTorneo2 And MapInfo(UserList(Userindex).Pos.Map).NumUsers > 1 And UserList(Userindex).Torneo2 < 10 _
                    Then

                Call SendData(ToIndex, Userindex, 0, "||No puedes salir hasta que consigas 10 victorias." & "´" & FontTypeNames.FONTTYPE_INFO)
                'Call ClosestLegalPos(UserList(UserIndex).Pos, nPos, 0)
                'If nPos.X <> 0 And nPos.Y <> 0 Then
                Call WarpUserChar(Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)

                'End If

                Exit Sub

            End If

            'pluto:hoy
            If Map > 177 And Map < 183 Then Call SendData(ToIndex, Userindex, 0, "TW" & 135)

            If UCase$(MapInfo(MapData(Map, X, Y).TileExit.Map).Terreno) = "CASA" And (UserList(Userindex).Stats.GLD < 30000 Or UserList( _
                    Userindex).Invent.ArmourEqpObjIndex = 0 Or EsNewbie(Userindex) Or UserList(Userindex).NroMacotas > 0 Or UserList( _
                    Userindex).flags.Montura > 0) Then

                'No llevas oro a la casa
                Call SendData(ToIndex, Userindex, 0, _
                        "||Los espíritus no te dejan entrar si tienes menos de 30000 Monedas, eres Newbie, llevas mascotas o estás Desnudo." & "´" _
                        & FontTypeNames.FONTTYPE_INFO)
                'Call ClosestLegalPos(UserList(UserIndex).Pos, nPos, 0)
                'If nPos.X <> 0 And nPos.Y <> 0 Then
                Call WarpUserChar(Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)

                'End If

                Exit Sub

            End If

            'pluto:6.0A añado caballero
            If (MapData(Map, X, Y).TileExit.Map = mapi Or MapData(Map, X, Y).TileExit.Map = 92) And (UserList(Userindex).NroMacotas > 0 Or UserList( _
                    Userindex).flags.Montura > 0) Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes acceder a esta sala con mascotas." & "´" & FontTypeNames.FONTTYPE_INFO)
                ' Call ClosestLegalPos(UserList(UserIndex).Pos, nPos, 0)
                'If nPos.X <> 0 And nPos.Y <> 0 Then
                'Call WarpUserChar(UserIndex, nPos.Map, nPos.X, nPos.Y)
                Call WarpUserChar(Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)

                'End If
                Exit Sub

            End If

            'pluto:2.17 mapa conquistas
            'If MapInfo(MapData(Map, X, Y).TileExit.Map).Terreno = "CONQUISTA" And UserList(UserIndex).Faccion.ArmadaReal = 0 And UserList(UserIndex).Faccion.FuerzasCaos = 0 Then
            'Call SendData(ToIndex, UserIndex, 0, "||No estás en ninguna Armada." & FONTTYPENAMES.FONTTYPE_INFO)
            'Call ClosestLegalPos(UserList(UserIndex).Pos, nPos, 0)
            'If nPos.X <> 0 And nPos.Y <> 0 Then

            'Call WarpUserChar(UserIndex, UserList(UserIndex).Pos.Map, UserList(UserIndex).Pos.X, UserList(UserIndex).Pos.Y)
            ' End If
            'exit sub
            'Exit Sub
            'End If
            '-----------------
            'pluto:2-3-04
            If MapInfo(MapData(Map, X, Y).TileExit.Map).StartPos.Map = 178 And MapInfo(MapData(Map, X, Y).TileExit.Map).StartPos.Y = 93 And _
                    UserList(Userindex).Stats.ELV < 30 Then
                Call SendData(ToIndex, Userindex, 0, "||Necesitas ser Level 30 para acceder a la Pirámide." & "´" & FontTypeNames.FONTTYPE_INFO)
                'Call ClosestLegalPos(UserList(UserIndex).Pos, nPos, 0)
                'If nPos.X <> 0 And nPos.Y <> 0 Then
                Call WarpUserChar(Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)

                'End If
                Exit Sub

            End If

            'pluto:6.8---------------------------------------
                
            If UCase$(MapInfo(MapData(Map, X, Y).TileExit.Map).Terreno) = "CASTILLO" And UserList(Userindex).GuildInfo.GuildName <> "" Then
            
                If Not PuedeEntrarACastillo(Userindex, UserList(Userindex).GuildInfo.GuildName, MapData(Map, X, Y).TileExit.Map) Then
                    Call SendData(ToIndex, Userindex, 0, "||Tu clan a llegado al limite de usuario en el mapa." & "´" & FontTypeNames.FONTTYPE_INFO)
                    Call WarpUserChar(Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)
                    Exit Sub

                End If

            End If

            '------------------------------------------------

            'pluto:2.17-----------------------
            'If MapInfo(MapData(Map, X, Y).TileExit.Map).Terreno <> "ALDEA" And EsNewbie(UserIndex) And UserList(UserIndex).Remort = 0 Then
            'Call SendData(ToIndex, UserIndex, 0, "Z8")
            'Call ClosestLegalPos(UserList(UserIndex).Pos, nPos, 0)
            'If nPos.X <> 0 And nPos.Y <> 0 Then
            'Call WarpUserChar(UserIndex, UserList(UserIndex).Pos.Map, UserList(UserIndex).Pos.X, UserList(UserIndex).Pos.Y)

            'exit sub
            'End If
            'End If
            '--------------------------------
            '¿Es mapa de newbies?
            If UCase$(MapInfo(MapData(Map, X, Y).TileExit.Map).Restringir) = "SI" Then

                '¿El usuario es un newbie?
                If EsNewbie(Userindex) Then

                    If LegalPos(MapData(Map, X, Y).TileExit.Map, MapData(Map, X, Y).TileExit.X, MapData(Map, X, Y).TileExit.Y, PuedeAtravesarAgua( _
                            Userindex)) Then

                        If FxFlag Then    '¿FX?
                            Call WarpUserChar(Userindex, MapData(Map, X, Y).TileExit.Map, MapData(Map, X, Y).TileExit.X, MapData(Map, X, _
                                    Y).TileExit.Y, True)
                        Else
                            Call WarpUserChar(Userindex, MapData(Map, X, Y).TileExit.Map, MapData(Map, X, Y).TileExit.X, MapData(Map, X, _
                                    Y).TileExit.Y)

                        End If

                    Else
                        Call ClosestLegalPos(MapData(Map, X, Y).TileExit, nPos, 0)

                        If nPos.X <> 0 And nPos.Y <> 0 Then

                            If FxFlag Then
                                Call WarpUserChar(Userindex, nPos.Map, nPos.X, nPos.Y, True)
                            Else
                                Call WarpUserChar(Userindex, nPos.Map, nPos.X, nPos.Y)

                            End If

                        End If

                    End If

                Else    'No es newbie
                    Call SendData(ToIndex, Userindex, 0, "||Mapa exclusivo para newbies." & "´" & FontTypeNames.FONTTYPE_INFO)

                    Call ClosestLegalPos(UserList(Userindex).Pos, nPos, 0)

                    If nPos.X <> 0 And nPos.Y <> 0 Then
                        Call WarpUserChar(Userindex, nPos.Map, nPos.X, nPos.Y)

                    End If

                End If

            Else    'No es un mapa de newbies

                If LegalPos(MapData(Map, X, Y).TileExit.Map, MapData(Map, X, Y).TileExit.X, MapData(Map, X, Y).TileExit.Y, PuedeAtravesarAgua( _
                        Userindex)) Then

                    If FxFlag Then
                        Call WarpUserChar(Userindex, MapData(Map, X, Y).TileExit.Map, MapData(Map, X, Y).TileExit.X, MapData(Map, X, Y).TileExit.Y, _
                                True)
                    Else
                        Call WarpUserChar(Userindex, MapData(Map, X, Y).TileExit.Map, MapData(Map, X, Y).TileExit.X, MapData(Map, X, Y).TileExit.Y)

                    End If

                Else
                    Call ClosestLegalPos(MapData(Map, X, Y).TileExit, nPos, 0)

                    If nPos.X <> 0 And nPos.Y <> 0 Then

                        If FxFlag Then
                            Call WarpUserChar(Userindex, nPos.Map, nPos.X, nPos.Y, True)
                        Else
                            Call WarpUserChar(Userindex, nPos.Map, nPos.X, nPos.Y)

                        End If

                    End If

                End If

            End If

        End If

    End If

    Exit Sub

errhandler:
    Call LogError("Error en ControlaSalidas ->Nom: " & UserList(Userindex).Name & " POS:" & UserList(Userindex).Pos.Map & " - " & UserList( _
            Userindex).Pos.X & " - " & UserList(Userindex).Pos.Y & " N: " & Err.number & " D: " & Err.Description)

End Sub

Public Sub DoTileEvents(ByVal Userindex As Integer, _
                        ByVal Map As Integer, _
                        ByVal X As Integer, _
                        ByVal Y As Integer)

End Sub

Function InMapBounds(ByVal Map As Integer, _
                     ByVal X As Integer, _
                     ByVal Y As Integer) As Boolean

    On Error GoTo fallo

    If X < MinXBorder Or X > MaxXBorder Or Y < MinYBorder Or Y > MaxYBorder Or Map = 0 Then
        InMapBounds = False
    Else
        InMapBounds = True

    End If

    Exit Function
fallo:
    Call LogError("INMAPBOUNDS" & Err.number & " D: " & Err.Description)

End Function

Sub ClosestLegalPos(Pos As WorldPos, ByRef nPos As WorldPos, agua As Byte)

'*****************************************************************
'Encuentra la posicion legal mas cercana y la guarda en nPos
'*****************************************************************
    On Error GoTo fallo

    Dim Notfound As Boolean
    Dim loopc As Integer
    Dim tX As Integer
    Dim tY As Integer
    Dim pagua As Boolean

    If agua = 1 Then pagua = True Else pagua = False
    nPos.Map = Pos.Map
nop:

    Do While Not LegalPos(Pos.Map, nPos.X, nPos.Y, pagua)

        If loopc > 12 Then
            Notfound = True
            Exit Do

        End If

        For tY = Pos.Y - loopc To Pos.Y + loopc
            For tX = Pos.X - loopc To Pos.X + loopc

                'pluto:2.17 añade exits
                If tX > 99 Or tY > 99 Or tX < 1 Or tY < 1 Then GoTo nuu
                If LegalPos(nPos.Map, tX, tY, pagua) Then    'and MapData(nPos.Map, tX, tY).TileExit.Map = 0

                    nPos.X = tX
                    nPos.Y = tY
                    '¿Hay objeto?
                    tX = Pos.X + loopc
                    tY = Pos.Y + loopc
                    Notfound = False
                    Exit Sub

                End If

nuu:
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
    Call LogError("CLOSESTLEGALPOS" & Err.number & " D: " & nPos.Map & "-" & tX & "-" & tY & pagua)

End Sub

Function NameIndex(ByVal Name As String) As Integer

    On Error GoTo fallo

    Dim Userindex As Integer

    '¿Nombre valido?
    If Name = "" Then
        NameIndex = 0
        Exit Function

    End If

    Userindex = 1

    If (Right$(Name, 1) <> "$") Then
        GoTo prim
    Else
        Name = Left$(Name, Len(Name) - 1)

    End If

    Do Until UCase$(UserList(Userindex).Name) = UCase$(Name)
        Userindex = Userindex + 1

        If Userindex > MaxUsers Then
            Userindex = 0
            Exit Do

        End If

    Loop
    GoTo final
prim:

    Do Until UCase$(Left$(UserList(Userindex).Name, Len(Name))) = UCase$(Name)
        Userindex = Userindex + 1

        If Userindex > MaxUsers Then
            Userindex = 0
            Exit Do

        End If

    Loop
final:
    NameIndex = Userindex

    Exit Function
fallo:
    Call LogError("NAMEINDEX" & Err.number & " D: " & Err.Description)

End Function

Function IP_Index(ByVal inIP As String) As Integer

    On Error GoTo local_errHand

    Dim Userindex As Integer

    '¿Nombre valido?
    If inIP = "" Then
        IP_Index = 0
        Exit Function

    End If

    Userindex = 1

    Do Until UserList(Userindex).ip = inIP

        Userindex = Userindex + 1

        If Userindex > MaxUsers Then
            IP_Index = 0
            Exit Function

        End If

    Loop

    IP_Index = Userindex
    Exit Function
local_errHand:
    IP_Index = Userindex
    Call LogError("IP INDEX" & Err.number & " D: " & Err.Description)

End Function

Function CheckForSameIP(ByVal Userindex As Integer, ByVal UserIP As String) As Boolean

    On Error GoTo fallo

    Dim loopc As Integer

    For loopc = 1 To MaxUsers

        If UserList(loopc).flags.UserLogged = True Then
            If UserList(loopc).ip = UserIP And Userindex <> loopc Then
                CheckForSameIP = True
                Exit Function

            End If

        End If

    Next loopc

    CheckForSameIP = False
    Exit Function
fallo:
    Call LogError("CHECKFORSAMEIP" & Err.number & " D: " & Err.Description)

End Function

Function CheckForSameName(ByVal Userindex As Integer, ByVal Name As String) As Boolean

'Controlo que no existan usuarios con el mismo nombre
    On Error GoTo fallo

    Dim loopc As Integer

    For loopc = 1 To MaxUsers

        If UserList(loopc).flags.UserLogged Then
            If UCase$(UserList(loopc).Name) = UCase$(Name) Then
                CheckForSameName = True
                Call CloseUser(loopc)
                Exit Function

            End If

        End If

    Next loopc

    CheckForSameName = False

    Exit Function
fallo:
    Call LogError("CHECKFORSAMENAME" & Err.number & " D: " & Err.Description)

End Function

Sub HeadtoPos(Head As Byte, ByRef Pos As WorldPos)

'*****************************************************************
'Toma una posicion y se mueve hacia donde esta perfilado
'*****************************************************************
    On Error GoTo fallo

    Dim X As Integer
    Dim Y As Integer
    Dim tempVar As Single
    Dim nx As Integer
    Dim nY As Integer

    X = Pos.X
    Y = Pos.Y

    If Head = NORTH Then
        nx = X
        nY = Y - 1

    End If

    If Head = SOUTH Then
        nx = X
        nY = Y + 1

    End If

    If Head = EAST Then
        nx = X + 1
        nY = Y

    End If

    If Head = WEST Then
        nx = X - 1
        nY = Y

    End If

    'Devuelve valores
    Pos.X = nx
    Pos.Y = nY
    Exit Sub
fallo:
    Call LogError("HEADTOPOS" & Err.number & " D: " & Err.Description)

End Sub

Function LegalPos(ByVal Map As Integer, _
                  ByVal X As Integer, _
                  ByVal Y As Integer, _
                  Optional ByVal PuedeAgua = False) As Boolean

'¿Es un mapa valido?
    On Error GoTo fallo

    If (Map <= 0 Or Map > NumMaps) Or (X < MinXBorder Or X > MaxXBorder Or Y < MinYBorder Or Y > MaxYBorder) Then
        LegalPos = False
    Else

        If Not PuedeAgua Then
            LegalPos = (MapData(Map, X, Y).Blocked <> 1) And (MapData(Map, X, Y).Userindex = 0) And (MapData(Map, X, _
                                                                                                             Y).NpcIndex = 0) And (Not HayAgua(Map, X, Y))
        Else
            LegalPos = (MapData(Map, X, Y).Blocked <> 1) And (MapData(Map, X, Y).Userindex = 0) And (MapData(Map, X, _
                                                                                                             Y).NpcIndex = 0)    'And

            '(HayAgua(Map, x, Y))
        End If

        'MsgBox (LegalPos)
    End If

    Exit Function
fallo:
    Call LogError("LEGALPOS" & Err.number & " D: " & Err.Description)

End Function

Function LegalPosNPC(ByVal Map As Integer, _
                     ByVal X As Integer, _
                     ByVal Y As Integer, _
                     ByVal AguaValida As Byte) As Boolean

    On Error GoTo fallo

    If (Map <= 0 Or Map > NumMaps) Or (X < MinXBorder Or X > MaxXBorder Or Y < MinYBorder Or Y > MaxYBorder) Then
        LegalPosNPC = False
    Else
        Dim a As Integer
        a = AguaValida + 1

        If AguaValida = 0 Or AguaValida = 11 Then
            LegalPosNPC = (MapData(Map, X, Y).Blocked <> a) And (MapData(Map, X, Y).Userindex = 0) And (MapData(Map, _
                                                                                                                X, Y).NpcIndex = 0) And (MapData(Map, X, Y).trigger <> POSINVALIDA) And Not HayAgua(Map, X, Y)
        Else
            LegalPosNPC = (MapData(Map, X, Y).Blocked <> 1) And (MapData(Map, X, Y).Userindex = 0) And (MapData(Map, _
                                                                                                                X, Y).NpcIndex = 0) And (MapData(Map, X, Y).trigger <> POSINVALIDA)

        End If

    End If

    Exit Function
fallo:
    Call LogError("LEGALPOSNPC" & Err.number & " D: " & Err.Description)

End Function

Sub SendHelp(ByVal index As Integer)

    On Error GoTo fallo

    Dim NumHelpLines As Integer
    Dim loopc As Integer

    NumHelpLines = val(GetVar(DatPath & "Help.dat", "INIT", "NumLines"))

    For loopc = 1 To NumHelpLines
        Call SendData(ToIndex, index, 0, "||" & GetVar(DatPath & "Help.dat", "Help", "Line" & loopc) & "´" & _
                                         FontTypeNames.FONTTYPE_INFO)
    Next loopc

    Exit Sub
fallo:
    Call LogError("SENDHELP" & Err.number & " D: " & Err.Description)

End Sub

'pluto:hoy
Public Sub Gusano(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim daño As Integer
    Dim lado As Integer
    daño = RandomNumber(5, 20)
    lado = RandomNumber(35, 36)
    Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & _
                                                                         lado & "," & 1)
    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 121)
    UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MinHP - daño
    Call SendData(ToIndex, Userindex, 0, "|| ¡¡ Un Gusano te causa " & daño & " de daño !!" & "´" & _
                                         FontTypeNames.FONTTYPE_FIGHT)
    Call SendUserStatsVida(Userindex)

    If UserList(Userindex).Stats.MinHP <= 0 Then Call UserDie(Userindex)
    Exit Sub
fallo:
    Call LogError("GUSANO" & Err.number & " D: " & Err.Description)

End Sub

'pluto:hoy
Public Sub Trampa(ByVal Userindex As Integer, Tipotrampa As Integer)

    On Error GoTo fallo

    Dim daño As Integer
    daño = RandomNumber(5, 20)
    Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & _
                                                                         Tipotrampa & "," & 1)
    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 120)
    UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MinHP - daño
    Call SendData(ToIndex, Userindex, 0, "|| ¡¡ Una trampa te causa " & daño & " de daño !!" & "´" & _
                                         FontTypeNames.FONTTYPE_FIGHT)
    Call SendUserStatsVida(Userindex)

    If UserList(Userindex).Stats.MinHP <= 0 Then Call UserDie(Userindex)
    Exit Sub
fallo:
    Call LogError("TRAMPA " & Err.number & " D: " & Err.Description)

End Sub

Public Sub Expresar(ByVal NpcIndex As Integer, ByVal Userindex As Integer)

    On Error GoTo fallo

    If Npclist(NpcIndex).NroExpresiones > 0 Then
        Dim randomi
        randomi = RandomNumber(1, Npclist(NpcIndex).NroExpresiones)
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "6°" & Npclist(NpcIndex).Expresiones(randomi) _
                                                                        & "°" & Npclist(NpcIndex).Char.CharIndex)

    End If

    Exit Sub
fallo:
    Call LogError("EXPRESAR " & Err.number & " D: " & Err.Description)

End Sub

Sub MirarDerecho(ByVal Userindex As Integer, _
                 ByVal Map As Integer, _
                 ByVal X As Integer, _
                 ByVal Y As Integer)

    On Error GoTo fallo

    Dim TempCharIndex As Integer
    Dim foundchar As Integer

    '¿Posicion valida?
    If InMapBounds(Map, X, Y) Then

        '¿Es un personaje?
        If Y + 1 <= YMaxMapSize Then
            If MapData(Map, X, Y + 1).Userindex > 0 Then
                TempCharIndex = MapData(Map, X, Y + 1).Userindex
                foundchar = 1

            End If

            If MapData(Map, X, Y + 1).NpcIndex > 0 Then
                TempCharIndex = MapData(Map, X, Y + 1).NpcIndex
                foundchar = 2

            End If

        End If

        '¿Es un personaje?
        If foundchar = 0 Then
            If MapData(Map, X, Y).Userindex > 0 Then
                TempCharIndex = MapData(Map, X, Y).Userindex
                foundchar = 1

            End If

            If MapData(Map, X, Y).NpcIndex > 0 Then
                TempCharIndex = MapData(Map, X, Y).NpcIndex
                foundchar = 2

            End If

        End If

        If foundchar = 1 Then
            Dim genero1 As Byte

            'pluto:6.0A
            If UserList(TempCharIndex).flags.Privilegios > 0 Then Exit Sub
            Dim UrlClan As String

            If UserList(TempCharIndex).GuildInfo.GuildName = "" Then
                UrlClan = 1
            Else
                Dim TotalClanes As Integer
                Dim NumGuild As Integer
                Dim RevisoGuild As String
                Dim Emblema As String
                TotalClanes = GetVar(App.Path & "\Guilds\" & "GuildsInfo.inf", "Init", "NroGuilds")

                For NumGuild = 1 To TotalClanes
                    RevisoGuild = GetVar(App.Path & "\Guilds\" & "GuildsInfo.inf", "GUILD" & NumGuild, "GuildName")

                    If RevisoGuild = UserList(TempCharIndex).GuildInfo.GuildName Then
                        Exit For

                    End If

                Next
                Dim oGuild As cGuild
                Set oGuild = FetchGuild(UserList(TempCharIndex).GuildInfo.GuildName)
                UrlClan = oGuild.Emblema

                If UrlClan = "" Then UrlClan = 1

            End If

            If UCase$(UserList(TempCharIndex).Genero) = "HOMBRE" Then genero1 = 1 Else genero1 = 2
            Call SendData(ToIndex, Userindex, 0, "K1" & UserList(TempCharIndex).Name & "," & UserList( _
                                                 TempCharIndex).Hogar & "," & UserList(TempCharIndex).clase & "," & UserList(TempCharIndex).raza & _
                                                 "," & UserList(TempCharIndex).Remort & "," & genero1 & "," & UserList(TempCharIndex).Nhijos & "," _
                                                 & UserList(TempCharIndex).Hijo(1) & "," & UserList(TempCharIndex).Hijo(2) & "," & UserList( _
                                                 TempCharIndex).Hijo(3) & "," & UserList(TempCharIndex).Hijo(4) & "," & UserList( _
                                                 TempCharIndex).Hijo(5) & "," & UserList(TempCharIndex).Padre & "," & UserList( _
                                                 TempCharIndex).Madre & "," & UserList(TempCharIndex).Esposa & "," & UserList(TempCharIndex).Amor _
                                                 & "," & UserList(TempCharIndex).Embarazada & ";" & UrlClan)

        End If

    End If

    Exit Sub
fallo:
    Call LogError("MirarDerecho" & Err.number & " D: " & Err.Description)

End Sub

Sub LookatTile(ByVal Userindex As Integer, _
               ByVal Map As Integer, _
               ByVal X As Integer, _
               ByVal Y As Integer)

    On Error GoTo fallo

    'Responde al click del usuario sobre el mapa
    Dim foundchar As Byte
    Dim FoundSomething As Byte
    Dim TempCharIndex As Integer
    Dim Stat As String
    Dim clickpiso As WorldPos
    Dim MiObj As obj

    '¿Posicion valida?
    If InMapBounds(Map, X, Y) Then
        UserList(Userindex).flags.TargetMap = Map
        UserList(Userindex).flags.TargetX = X
        UserList(Userindex).flags.TargetY = Y

        '¿Es un obj?
        If MapData(Map, X, Y).OBJInfo.ObjIndex > 0 Then
            'Informa el nombre

            'pluto:hoy
            If UserList(Userindex).Pos.Map = 180 And ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).OBJType = 57 Then
                If MapData(Map, X, Y).OBJInfo.ObjIndex = ResEgipto Then
                    Call WarpUserChar(Userindex, 182, 47, 50, True)
                    'pluto:2-3-04
                    Call SendData(ToMap, 0, 0, "TW" & 138)
                    Call LoadEgipto
                Else: Call WarpUserChar(Userindex, 181, 42, 66, True)

                End If

            End If

            'pluto:2-3-04
            If ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).OBJType = 58 Then
                If UltimoBan <> "" Then Call SendData(ToIndex, Userindex, 0, _
                                                      "||Este es el destino al que se vió reducido " & UltimoBan & _
                                                      " por las grandes fechorías que cometió, siendo aquí colgado en público para su verguenza." & _
                                                      "´" & FontTypeNames.FONTTYPE_FIGHT)

                If UltimoBan = "" Then Call SendData(ToIndex, Userindex, 0, _
                                                     "||En estos momentos no hay ningún delincuente ahorcado." & "´" & _
                                                     FontTypeNames.FONTTYPE_FIGHT)

            End If

            'pluto:2.4
            Dim Tipo As Integer
            Tipo = ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).OBJType

            If Tipo = 44 Or Tipo = 45 Then
                Call SendData2(ToIndex, Userindex, 0, 77, Tipo)

            End If

            'pluto:2-3-04 momia faraón
            If ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).OBJType = 59 Then
                If Tesoromomia = 0 Then
                    Call SpawnNpc(611, UserList(Userindex).Pos, True, False)
                    Tesoromomia = 1
                Else
                    Call SendData(ToIndex, Userindex, 0, "|| ¡¡ Se han llevado el tesoro !!" & "´" & _
                                                         FontTypeNames.FONTTYPE_FIGHT)

                End If

            End If

            'Caballero de la Muerte
            If ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).OBJType = 70 Then
                If Tesorocaballero = 0 Then
                    Call SpawnNpc(726, UserList(Userindex).Pos, True, False)
                    Tesorocaballero = 1
                Else
                    Call SendData(ToIndex, Userindex, 0, "|| ¡¡ El Caballero ya ha sido desterrado !!" & "´" & _
                                                         FontTypeNames.FONTTYPE_FIGHT)

                End If

            End If

            Dim ab As String

            'pluto:2.10
            If UserList(Userindex).flags.Privilegios > 1 Then
                Call SendData(ToIndex, Userindex, 0, "||Objeto Numero: " & MapData(Map, X, Y).OBJInfo.ObjIndex & "´" _
                                                     & FontTypeNames.FONTTYPE_INFO)

            End If

            If ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).Peso > 0 Then ab = " " & (ObjData(MapData(Map, X, _
                                                                                                      Y).OBJInfo.ObjIndex).Peso * MapData(Map, X, Y).OBJInfo.Amount) & " Kg" Else ab = ""

            If (MapData(Map, X, Y).OBJInfo.Amount > 1 And ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).OBJType <> 4) _
               Then
                Call SendData(ToIndex, Userindex, 0, "||" & MapData(Map, X, Y).OBJInfo.Amount & " " & ObjData(MapData( _
                                                                                                              Map, X, Y).OBJInfo.ObjIndex).Name & ab & "´" & FontTypeNames.FONTTYPE_INFO)
            Else
                Call SendData(ToIndex, Userindex, 0, "||" & ObjData(MapData(Map, X, Y).OBJInfo.ObjIndex).Name & ab & _
                                                     "´" & FontTypeNames.FONTTYPE_INFO)

            End If

            'pluto:6.2----------------------
            If MapData(Map, X, Y).Userindex > 0 And UserList(Userindex).flags.Muerto = 0 Then
                If UserList(MapData(Map, X, Y).Userindex).flags.Muerto = 1 And MapData(Map, X, Y).Userindex <> _
                   Userindex Then
                    clickpiso.Map = Map
                    clickpiso.X = X
                    clickpiso.Y = Y

                    If Distancia(UserList(Userindex).Pos, clickpiso) < 2 Then
                        Call GetObjFantasma(Userindex, X, Y)

                    End If

                End If

            End If

            '----------------------------------

            ' Then Call SendData(ToIndex, UserIndex, 0, "||" &  & " Kg" & FONTTYPENAMES.FONTTYPE_INFO)
            UserList(Userindex).flags.TargetObj = MapData(Map, X, Y).OBJInfo.ObjIndex
            UserList(Userindex).flags.TargetObjMap = Map
            UserList(Userindex).flags.TargetObjX = X
            UserList(Userindex).flags.TargetObjY = Y
            FoundSomething = 1
        ElseIf MapData(Map, X + 1, Y).OBJInfo.ObjIndex > 0 Then

            'Informa el nombre
            If ObjData(MapData(Map, X + 1, Y).OBJInfo.ObjIndex).OBJType = OBJTYPE_PUERTAS Then
                Call SendData(ToIndex, Userindex, 0, "||" & ObjData(MapData(Map, X + 1, Y).OBJInfo.ObjIndex).Name & _
                                                     "´" & FontTypeNames.FONTTYPE_INFO)
                UserList(Userindex).flags.TargetObj = MapData(Map, X + 1, Y).OBJInfo.ObjIndex
                UserList(Userindex).flags.TargetObjMap = Map
                UserList(Userindex).flags.TargetObjX = X + 1
                UserList(Userindex).flags.TargetObjY = Y
                FoundSomething = 1

            End If

        ElseIf MapData(Map, X + 1, Y + 1).OBJInfo.ObjIndex > 0 Then

            If ObjData(MapData(Map, X + 1, Y + 1).OBJInfo.ObjIndex).OBJType = OBJTYPE_PUERTAS Then
                'Informa el nombre
                Call SendData(ToIndex, Userindex, 0, "||" & ObjData(MapData(Map, X + 1, Y + 1).OBJInfo.ObjIndex).Name _
                                                     & "´" & FontTypeNames.FONTTYPE_INFO)
                UserList(Userindex).flags.TargetObj = MapData(Map, X + 1, Y + 1).OBJInfo.ObjIndex
                UserList(Userindex).flags.TargetObjMap = Map
                UserList(Userindex).flags.TargetObjX = X + 1
                UserList(Userindex).flags.TargetObjY = Y + 1
                FoundSomething = 1

            End If

        ElseIf MapData(Map, X, Y + 1).OBJInfo.ObjIndex > 0 Then

            If ObjData(MapData(Map, X, Y + 1).OBJInfo.ObjIndex).OBJType = OBJTYPE_PUERTAS Then
                'Informa el nombre
                Call SendData(ToIndex, Userindex, 0, "||" & ObjData(MapData(Map, X, Y + 1).OBJInfo.ObjIndex).Name & _
                                                     "´" & FontTypeNames.FONTTYPE_INFO)
                UserList(Userindex).flags.TargetObj = MapData(Map, X, Y).OBJInfo.ObjIndex
                UserList(Userindex).flags.TargetObjMap = Map
                UserList(Userindex).flags.TargetObjX = X
                UserList(Userindex).flags.TargetObjY = Y + 1
                FoundSomething = 1

            End If

        End If

        'pluto:2.15 yoyita
        If UserList(Userindex).flags.TargetObj > 0 Then
            If ObjData(UserList(Userindex).flags.TargetObj).OBJType = OBJTYPE_PUERTAS Or ObjData(UserList( _
                                                                                                 Userindex).flags.TargetObj).OBJType = OBJTYPE_CARTELES Or ObjData(UserList( _
                                                                                                                                                                   Userindex).flags.TargetObj).OBJType = OBJTYPE_FOROS Or ObjData(UserList( _
                                                                                                                                                                                                                                  Userindex).flags.TargetObj).OBJType = OBJTYPE_LEÑA Then
                Call Accion(Userindex, UserList(Userindex).Pos.Map, X, Y)

            End If

        End If

        '-------

        '¿Es un personaje?
        If Y + 1 <= YMaxMapSize Then
            If MapData(Map, X, Y + 1).Userindex > 0 Then
                TempCharIndex = MapData(Map, X, Y + 1).Userindex
                foundchar = 1

            End If

            If MapData(Map, X, Y + 1).NpcIndex > 0 Then
                TempCharIndex = MapData(Map, X, Y + 1).NpcIndex
                foundchar = 2

            End If

        End If

        '¿Es un personaje?
        If foundchar = 0 Then
            If MapData(Map, X, Y).Userindex > 0 Then
                TempCharIndex = MapData(Map, X, Y).Userindex
                foundchar = 1

            End If

            If MapData(Map, X, Y).NpcIndex > 0 Then
                TempCharIndex = MapData(Map, X, Y).NpcIndex
                foundchar = 2

            End If

        End If

        'Reaccion al personaje
        If foundchar = 1 Then    '  ¿Encontro un Usuario?

            If UserList(TempCharIndex).flags.AdminInvisible = 0 Then

                If EsNewbie(TempCharIndex) Then
                    Stat = " <NEWBIE>"

                    'Iron AO: Rango GMS
                    'If UserList(Userindex).Name = "Pixel" Then
                        'If UserList(Userindex).GuildInfo.GuildName = "" Then
                            'UserList(Userindex).GuildInfo.GuildName = "Director Iron Ao"
                            'Call WarpUserChar(Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y, False)
                        'End If
                    'End If

                End If

                If UserList(TempCharIndex).Faccion.ArmadaReal = 1 Then
                    Stat = Stat & " <Ejercito Alianza> " & "<" & TituloReal(TempCharIndex) & ">"
                ElseIf UserList(TempCharIndex).Faccion.FuerzasCaos = 1 Then
                    Stat = Stat & " <Ejercito Horda> " & "<" & TituloCaos(TempCharIndex) & ">"
                    'legion
                ElseIf UserList(TempCharIndex).Faccion.ArmadaReal = 2 Then
                    Stat = Stat & " <Neutral> " & "<" & Titulolegion(TempCharIndex) & ">"

                End If
                
                
                If UserList(TempCharIndex).flags.LiderAlianza Then Stat = Stat & " <Lider Alianza> "
                If UserList(TempCharIndex).flags.LiderHorda Then Stat = Stat & " <Lider Horda> "

                If UserList(TempCharIndex).GuildInfo.GuildName <> "" Then
                    'pluto:2.4
                    'Nati: Ahora sera de un titulo segun sus puntos aportados al clan.
                    Dim a As String
                    a = " (Soldado)"

                    If UserList(TempCharIndex).Stats.PClan >= 100 Then a = " (Teniente)"
                    If UserList(TempCharIndex).Stats.PClan >= 250 Then a = " (Capitán)"
                    If UserList(TempCharIndex).Stats.PClan >= 500 Then a = " (General)"
                    If UserList(TempCharIndex).Stats.PClan >= 1000 Then a = " (Comandante)"
                    If UserList(TempCharIndex).Stats.PClan >= 1500 Then a = " (SubLider)"
                    If UserList(TempCharIndex).GuildInfo.GuildPoints >= 5000 Then a = " (Lider)"
                    'If UserList(TempCharIndex).GuildInfo.GuildPoints >= 1000 Then a = " (Teniente)"
                    'If UserList(TempCharIndex).GuildInfo.GuildPoints >= 2000 Then a = " (Capitán)"
                    'If UserList(TempCharIndex).GuildInfo.GuildPoints >= 3000 Then a = " (General)"
                    'If UserList(TempCharIndex).GuildInfo.GuildPoints >= 4000 Then a = " (SubLider)"
                    'If UserList(TempCharIndex).GuildInfo.GuildPoints >= 5000 Then a = " (Lider)"

                    Stat = Stat & " <" & UserList(TempCharIndex).GuildInfo.GuildName & a & ">"
                    '-----------------fin pluto:2.4-------------------

                End If

                If Len(UserList(TempCharIndex).Desc) > 1 Then
                    Stat = "||Ves a " & UserList(TempCharIndex).Name & Stat & " - " & UserList(TempCharIndex).Desc
                Else
                    'Call SendData(ToIndex, UserIndex, 0, "||Ves a " & UserList(TempCharIndex).Name & Stat)
                    Stat = "||Ves a " & UserList(TempCharIndex).Name & Stat

                End If

                If UserList(TempCharIndex).Remort = 1 Then Stat = Stat & " *" & UserList(TempCharIndex).Remorted & "*"
                'LEGION

                If UserList(TempCharIndex).Faccion.FuerzasCaos = 1 And UserList(TempCharIndex).flags.Privilegios = 0 Then
                    'Stat = Stat & " <CRIMINAL> ~255~0~0~1~0"
                    Stat = Stat & "´" & FontTypeNames.FONTTYPE_CONSEJOCAOSVesA
                ElseIf UserList(TempCharIndex).Faccion.ArmadaReal = 2 And UserList(TempCharIndex).flags.Privilegios = _
                       0 Then
                    'Stat = Stat & " <LEGIONARIO> ~0~255~0~1~0 "
                    Stat = Stat & "´" & FontTypeNames.FONTTYPE_CONSEJOVesa
                ElseIf UserList(TempCharIndex).Faccion.ArmadaReal = 1 Then
                    'Stat = Stat & " <CIUDADANO>~0~0~200~1~0"
                    Stat = Stat & "´" & FontTypeNames.FONTTYPE_CONSEJO
                ElseIf UserList(TempCharIndex).flags.Privilegios > 0 Then
                    'Stat = Stat & " <GameMaster>~255~255~255~1~0"
                    Stat = Stat & "´" & FontTypeNames.FONTTYPE_talk

                End If
                
                'If UserList(TempCharIndex).Stats.Elo = 0 And UserList(TempCharIndex).Stats.Elo < 50 Then Stat = Stat & "@" & " <Rango: Bronce V>"
                'If UserList(TempCharIndex).Stats.Elo > 51 And UserList(TempCharIndex).Stats.Elo < 100 Then Stat = Stat & " <Rango: Bronce IV>"
                'If UserList(TempCharIndex).Stats.Elo > 101 And UserList(TempCharIndex).Stats.Elo < 150 Then Stat = Stat & " <Rango: Bronce III>"
                'If UserList(TempCharIndex).Stats.Elo > 151 And UserList(TempCharIndex).Stats.Elo < 200 Then Stat = Stat & " <Rango: Bronce II>"
                'If UserList(TempCharIndex).Stats.Elo > 201 And UserList(TempCharIndex).Stats.Elo < 300 Then Stat = Stat & " <Rango: Bronce I>"
                'If UserList(TempCharIndex).Stats.Elo > 301 And UserList(TempCharIndex).Stats.Elo < 350 Then Stat = Stat & " <Rango: Plata V>"
                'If UserList(TempCharIndex).Stats.Elo > 351 And UserList(TempCharIndex).Stats.Elo < 400 Then Stat = Stat & " <Rango: Plata IV>"
                'If UserList(TempCharIndex).Stats.Elo > 401 And UserList(TempCharIndex).Stats.Elo < 450 Then Stat = Stat & " <Rango: Plata III>"
                'If UserList(TempCharIndex).Stats.Elo > 451 And UserList(TempCharIndex).Stats.Elo < 500 Then Stat = Stat & " <Rango: Plata II>"
                'If UserList(TempCharIndex).Stats.Elo > 501 And UserList(TempCharIndex).Stats.Elo < 600 Then Stat = Stat & " <Rango: Plata I>"
                'If UserList(TempCharIndex).Stats.Elo > 601 And UserList(TempCharIndex).Stats.Elo < 650 Then Stat = Stat & " <Rango: Oro V>"
                'If UserList(TempCharIndex).Stats.Elo > 651 And UserList(TempCharIndex).Stats.Elo < 700 Then Stat = Stat & " <Rango: Oro IV>"
                'If UserList(TempCharIndex).Stats.Elo > 701 And UserList(TempCharIndex).Stats.Elo < 750 Then Stat = Stat & " <Rango: Oro III>"
                'If UserList(TempCharIndex).Stats.Elo > 751 And UserList(TempCharIndex).Stats.Elo < 800 Then Stat = Stat & " <Rango: Oro II>"
                'If UserList(TempCharIndex).Stats.Elo > 801 And UserList(TempCharIndex).Stats.Elo < 900 Then Stat = Stat & " <Rango: Oro I>"
                'If UserList(TempCharIndex).Stats.Elo > 901 And UserList(TempCharIndex).Stats.Elo < 950 Then Stat = Stat & " <Rango: Platino V>"
                'If UserList(TempCharIndex).Stats.Elo > 951 And UserList(TempCharIndex).Stats.Elo < 1000 Then Stat = Stat & " <Rango: Platino IV>"
                'If UserList(TempCharIndex).Stats.Elo > 1001 And UserList(TempCharIndex).Stats.Elo < 1050 Then Stat = Stat & " <Rango: Platino III>"
                'If UserList(TempCharIndex).Stats.Elo > 1051 And UserList(TempCharIndex).Stats.Elo < 1100 Then Stat = Stat & " <Rango: Platino II>"
                'If UserList(TempCharIndex).Stats.Elo > 1101 And UserList(TempCharIndex).Stats.Elo < 1150 Then Stat = Stat & " <Rango: Platino I>"
                'If UserList(TempCharIndex).Stats.Elo > 1151 And UserList(TempCharIndex).Stats.Elo < 1200 Then Stat = Stat & " <Rango: Diamante V>"
                'If UserList(TempCharIndex).Stats.Elo > 1201 And UserList(TempCharIndex).Stats.Elo < 1300 Then Stat = Stat & " <Rango: Diamante IV>"
                'If UserList(TempCharIndex).Stats.Elo > 1301 And UserList(TempCharIndex).Stats.Elo < 1400 Then Stat = Stat & " <Rango: Diamante III>"
                'If UserList(TempCharIndex).Stats.Elo > 1401 And UserList(TempCharIndex).Stats.Elo < 1500 Then Stat = Stat & " <Rango: Diamante II>"
                'If UserList(TempCharIndex).Stats.Elo > 1501 And UserList(TempCharIndex).Stats.Elo < 2000 Then Stat = Stat & " <Rango: Diamante I>"
                'If UserList(TempCharIndex).Stats.Elo > 2001 Then Stat = Stat & " <Rango: Challenger>"
                
                Stat = Stat & "@" & UserList(TempCharIndex).Stats.Elo

                Call SendData(ToIndex, Userindex, 0, Stat)

                FoundSomething = 1
                UserList(Userindex).flags.TargetUser = TempCharIndex
                UserList(Userindex).flags.TargetNpc = 0
                UserList(Userindex).flags.TargetNpcTipo = 0
                'nati: hago que me envie el nombre del usuario
                Call SendData2(ToIndex, Userindex, 0, 115, UserList(TempCharIndex).Name)
                'nati: hago que me envie el nombre del usuario

            End If

        End If

        If foundchar = 2 Then    '¿Encontro un NPC?

            'pluto:6.4
            UserList(Userindex).flags.TargetUser = 0

            'pluto:2.15
            If Distancia(UserList(Userindex).Pos, Npclist(TempCharIndex).Pos) > 20 Then
                Call SendData(ToIndex, Userindex, 0, "L2")
                GoTo AI

            End If

            '¿Esta el user muerto? Si es asi no puede interactuar
            If UserList(Userindex).flags.Muerto = 1 And Npclist(TempCharIndex).NPCtype <> 1 Then
                Call SendData(ToIndex, Userindex, 0, "L3")
                Exit Sub

            End If

            '-------------------------------------------------
            '-------------------------------------------------
            'pluto:6.0A pongo selec case a los tipos de npcs
            '-------------------------------------------------
            '--------------------------------------------------
            UserList(Userindex).flags.TargetNpcTipo = Npclist(TempCharIndex).NPCtype
            UserList(Userindex).flags.TargetNpc = TempCharIndex

            'pluto:7.0
            If UserList(Userindex).flags.Privilegios > 0 Then
                Call SendData(ToIndex, Userindex, 0, "|| Número Npc: " & Npclist(TempCharIndex).numero & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)

            End If

            'pluto:6.0A
            If UserList(Userindex).flags.Navegando = 1 And (Npclist(TempCharIndex).Comercia > 0 Or Npclist( _
                                                            TempCharIndex).NPCtype = 1 Or Npclist(TempCharIndex).NPCtype = 4) Then
                Call SendData(ToIndex, Userindex, 0, "||¡¡Deja de Navegar!!" & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            Select Case Npclist(TempCharIndex).NPCtype

            Case 43
                Dim ViajeUlla As String
                Dim ViajeCaos As String
                Dim ViajeDescanso As String
                Dim ViajeAtlantis As String
                Dim ViajeArghal As String
                Dim ViajeEsperanza As String
                Dim ViajeNix As String
                Dim ViajeRinkel As String
                Dim ViajeBander As String
                Dim ViajeLindos As String

                '¿Esta en Nix?
                If UserList(Userindex).Pos.Map = 34 Then
                    ViajeUlla = 0
                    ViajeCaos = 0
                    ViajeDescanso = 0
                    ViajeAtlantis = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "ULLA@" & ViajeUlla)
                    Call SendData2(ToIndex, Userindex, 0, 116, "CAOS@" & ViajeCaos)
                    Call SendData2(ToIndex, Userindex, 0, 116, "DESCANSO@" & ViajeDescanso)
                    Call SendData2(ToIndex, Userindex, 0, 116, "ATLANTIS@" & ViajeAtlantis)

                End If

                '¿Esta en Ulla?
                If UserList(Userindex).Pos.Map = 1 Then
                    ViajeNix = 0
                    ViajeCaos = 0
                    ViajeDescanso = 0
                    ViajeBander = 0
                    ViajeRinkel = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "NIX@" & ViajeNix)
                    Call SendData2(ToIndex, Userindex, 0, 116, "CAOS@" & ViajeCaos)
                    Call SendData2(ToIndex, Userindex, 0, 116, "DESCANSO@" & ViajeDescanso)
                    Call SendData2(ToIndex, Userindex, 0, 116, "BANDER@" & ViajeBander)
                    Call SendData2(ToIndex, Userindex, 0, 116, "RINKEL@" & ViajeRinkel)

                End If

                '¿Esta en Descanso?
                If UserList(Userindex).Pos.Map = 81 Then
                    ViajeUlla = 0
                    ViajeNix = 0
                    ViajeCaos = 0
                    ViajeArghal = 0
                    ViajeBander = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "ULLA@" & ViajeUlla)
                    Call SendData2(ToIndex, Userindex, 0, 116, "BANDER@" & ViajeBander)
                    Call SendData2(ToIndex, Userindex, 0, 116, "NIX@" & ViajeNix)
                    Call SendData2(ToIndex, Userindex, 0, 116, "CAOS@" & ViajeCaos)
                    Call SendData2(ToIndex, Userindex, 0, 116, "ARGHAL@" & ViajeArghal)

                End If

                '¿Esta en Bander?
                If UserList(Userindex).Pos.Map = 59 Then
                    ViajeUlla = 0
                    ViajeDescanso = 0
                    ViajeAtlantis = 0
                    ViajeArghal = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "ULLA@" & ViajeUlla)
                    Call SendData2(ToIndex, Userindex, 0, 116, "DESCANSO@" & ViajeDescanso)
                    Call SendData2(ToIndex, Userindex, 0, 116, "ATLANTIS@" & ViajeAtlantis)
                    Call SendData2(ToIndex, Userindex, 0, 116, "ARGHAL@" & ViajeArghal)

                End If

                '¿Esta en Rinkel?
                If UserList(Userindex).Pos.Map = 20 Then
                    ViajeUlla = 0
                    ViajeLindos = 0
                    ViajeAtlantis = 0
                    ViajeEsperanza = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "ULLA@" & ViajeUlla)
                    Call SendData2(ToIndex, Userindex, 0, 116, "LINDOS@" & ViajeLindos)
                    Call SendData2(ToIndex, Userindex, 0, 116, "ATLANTIS@" & ViajeAtlantis)
                    Call SendData2(ToIndex, Userindex, 0, 116, "ESPERANZA@" & ViajeEsperanza)

                End If

                '¿Esta en Caos?
                If UserList(Userindex).Pos.Map = 170 Then
                    ViajeNix = 0
                    ViajeUlla = 0
                    ViajeLindos = 0
                    ViajeDescanso = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "NIX@" & ViajeNix)
                    Call SendData2(ToIndex, Userindex, 0, 116, "ULLA@" & ViajeUlla)
                    Call SendData2(ToIndex, Userindex, 0, 116, "LINDOS@" & ViajeLindos)
                    Call SendData2(ToIndex, Userindex, 0, 116, "DESCANSO@" & ViajeDescanso)

                End If

                '¿Esta en Arghal?
                If UserList(Userindex).Pos.Map = 151 Then
                    ViajeDescanso = 0
                    ViajeBander = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "DESCANSO@" & ViajeDescanso)
                    Call SendData2(ToIndex, Userindex, 0, 116, "BANDER@" & ViajeBander)

                End If

                '¿Esta en Atlantis?
                If UserList(Userindex).Pos.Map = 85 Then
                    ViajeNix = 0
                    ViajeBander = 0
                    ViajeRinkel = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "NIX@" & ViajeNix)
                    Call SendData2(ToIndex, Userindex, 0, 116, "BANDER@" & ViajeBander)
                    Call SendData2(ToIndex, Userindex, 0, 116, "RINKEL@" & ViajeRinkel)

                End If

                '¿Esta en Lindos?
                If UserList(Userindex).Pos.Map = 63 Then
                    ViajeCaos = 0
                    ViajeEsperanza = 0
                    ViajeRinkel = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "CAOS@" & ViajeCaos)
                    Call SendData2(ToIndex, Userindex, 0, 116, "ESPERANZA@" & ViajeEsperanza)
                    Call SendData2(ToIndex, Userindex, 0, 116, "RINKEL@" & ViajeRinkel)

                End If

                '¿Esta en Isla Esperanza?
                If UserList(Userindex).Pos.Map = 111 Then
                    ViajeLindos = 0
                    ViajeRinkel = 0
                    Call SendData2(ToIndex, Userindex, 0, 116, "LINDOS@" & ViajeLindos)
                    Call SendData2(ToIndex, Userindex, 0, 116, "RINKEL@" & ViajeRinkel)

                End If

                'pluto:7.0
            Case 62
                Call SendData2(ToIndex, Userindex, 0, 111, UserList(Userindex).flags.Creditos)

                Exit Sub

            Case 1

                'resucitar
                If UserList(Userindex).flags.Muerto = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "TW" & 181)
                    Exit Sub

                End If

                'pluto:2.18
                'If (MapInfo(Npclist(TempCharIndex).Pos.Map).Dueño = 1 And Criminal(UserIndex)) Or (MapInfo(Npclist(TempCharIndex).Pos.Map).Dueño = 2 And Not Criminal(UserIndex)) Then
                'Call SendData(ToIndex, UserIndex, 0, "||6°" & "No puedo resucitarte, tu armada no controla esta ciudad." & "°" & Npclist(TempCharIndex).Char.CharIndex)
                'Exit Sub
                'End If
                '--------
                'pluto:6.0A----------
                If UserList(Userindex).flags.Navegando > 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||¡¡Deja de Navegar!!" & "´" & _
                                                         FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'pluto:6.9
                If Distancia(UserList(Userindex).Pos, Npclist(UserList(Userindex).flags.TargetNpc).Pos) > 12 Then
                    Call SendData(ToIndex, Userindex, 0, "L2")
                    Exit Sub

                End If

                '-------------------
                Call RevivirUsuario(Userindex)
                Call SendData(ToIndex, Userindex, 0, "S3")
                'Call SendData(ToIndex, UserIndex, 0, "||¡¡Hás sido resucitado!!" & FONTTYPENAMES.FONTTYPE_INFO)
                Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList( _
                                                                                     Userindex).Char.CharIndex & "," & 72 & "," & 1)
                UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP
                Call SendUserStatsVida(val(Userindex))
                'Call SendData(ToIndex, UserIndex, 0, "||¡¡Hás sido curado!!" & FONTTYPENAMES.FONTTYPE_INFO)
                Exit Sub

            Case 36

                If UserList(Userindex).flags.Minotauro > 0 Then
                    Call SendData(ToPCArea, Userindex, Npclist(TempCharIndex).Pos.Map, _
                                  "||8° No puedes liberar el Minotauro más veces." & "°" & Npclist( _
                                  TempCharIndex).Char.CharIndex)
                    Exit Sub

                End If

                If EstadoMinotauro = 2 Then
                    Call SendData(ToPCArea, Userindex, Npclist(TempCharIndex).Pos.Map, _
                                  "||8° El Minotauro fué liberado hace poco y debes esperar un tiempo para poder liberarlo de nuevo." _
                                  & "°" & Npclist(TempCharIndex).Char.CharIndex)
                    Exit Sub

                End If

                If Not TieneObjetos(1218, 1, Userindex) Then
                    Call SendData(ToPCArea, Userindex, Npclist(TempCharIndex).Pos.Map, _
                                  "||8° Necesitas un Hilo de Ariadna que poseen algunas Viudas Negras para liberar el Minotauro." _
                                  & "°" & Npclist(TempCharIndex).Char.CharIndex)
                    Exit Sub
                Else
                    Call QuitarObjetos(1218, 1, Userindex)

                End If

                'pluto 6.0a LIBERA
                If Minotauro = "" Then
                    Call SendData(ToPCArea, Userindex, Npclist(TempCharIndex).Pos.Map, _
                                  "||8° Aprisa!, El Minotauro ha huido al verte, búscalo y mátalo antes de que lo haga cualquier otro..." _
                                  & "°" & Npclist(TempCharIndex).Char.CharIndex)
                    Minotauro = UserList(Userindex).Name
                    Dim mapita As Integer
                    Dim CabalgaPos As WorldPos
                    Dim ini As Integer
a:
                    mapita = RandomNumber(1, 277)
                    CabalgaPos.X = RandomNumber(15, 80)
                    CabalgaPos.Y = RandomNumber(15, 80)
                    CabalgaPos.Map = mapita

                    If MapInfo(CabalgaPos.Map).Domar > 0 Then GoTo a
                    ini = SpawnNpc(692, CabalgaPos, False, True)

                    If ini = MAXNPCS Then GoTo a:
                    'CabalgaPos.Map = RandomNumber(1, 277)
                    'mapita = CabalgaPos.Map
                    'ini = SpawnNpc(692, CabalgaPos, False, True)
                    'If ini = MAXNPCS Then mapita = 1000

                    Call SendData(ToAll, Userindex, 0, "|| El Minotauro ha sido liberado por " & UserList( _
                                                       Userindex).Name & "´" & FontTypeNames.FONTTYPE_PARTY)
                    EstadoMinotauro = 1
                    MinutosMinotauro = 30

                    'Call WriteVar(IniPath & "cabalgar.txt", MiNPC.Name, "Mapa", val(Mapita))

                    Call LogCasino("Minotauro: " & CabalgaPos.Map & "-" & CabalgaPos.X & "-" & CabalgaPos.Y & _
                                   " liberado por " & UserList(Userindex).Name)
                Else    'NO LIBERA

                    If Minotauro <> UserList(Userindex).Name Then
                        Call SendData(ToPCArea, Userindex, Npclist(TempCharIndex).Pos.Map, _
                                      "||8° El Minotauro fué liberado por otro personaje, debes esperar que sea capturado." _
                                      & "°" & Npclist(TempCharIndex).Char.CharIndex)
                    Else
                        Call SendData(ToPCArea, Userindex, Npclist(TempCharIndex).Pos.Map, _
                                      "||8° Aprisa!, El Minotauro ha huido al verte, búscalo y mátalo antes de que lo haga cualquier otro..." _
                                      & "°" & Npclist(TempCharIndex).Char.CharIndex)

                    End If

                End If

                Exit Sub

            Case 37
                'pluto:6.0A
                Call SendData(ToIndex, Userindex, 0, "H6")
                Exit Sub

            Case 4
                'pluto:6.0A
                Call SendData(ToIndex, Userindex, 0, "H1" & "," & UserList(Userindex).Stats.Banco)
                Exit Sub

            Case 26

                'pluto:2.22-------------------------------------------
                If MapData(277, 36, 70).OBJInfo.ObjIndex > 0 And UserList(Userindex).Pos.Map = 277 And UserList( _
                   Userindex).Pos.X = 36 And UserList(Userindex).Pos.Y = 70 Then
                    Dim nuo As Integer
                    Dim nuoc As Integer
                    nuo = MapData(277, 36, 70).OBJInfo.ObjIndex
                    nuoc = MapData(277, 36, 70).OBJInfo.Amount

                    If (ObjData(nuo).LingH = 0 And ObjData(nuo).LingP = 0 And ObjData(nuo).LingO = 0) Then
                        Call SendData(ToIndex, Userindex, 0, "|| Ese Objeto no lo puedo fundir!!" & "´" & _
                                                             FontTypeNames.FONTTYPE_COMERCIO)
                        Exit Sub

                    End If

                    'pluto:6.0A
                    If ObjData(nuo).LingH * nuoc > 10000 Or ObjData(nuo).LingP * nuoc > 10000 Or ObjData( _
                       nuo).LingO * nuoc > 10000 Then
                        Call SendData(ToIndex, Userindex, 0, _
                                      "|| No puedo fundir tantos objetos, por favor suelta menos objetos." & "´" & _
                                      FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If

                    Dim Esvende As Byte

                    If ObjData(nuo).Vendible = 0 Then Esvende = 5 Else Esvende = 60
                    'borramos el objeto del suelo
                    Call EraseObj(ToMap, 0, 277, 10000, 277, 36, 70)
                    'pluto:6.0A
                    Call LogNpcFundidor(UserList(Userindex).Name & " Funde Obj: " & nuo & " Cant: " & nuoc)

                    'Dim MiObj As obj

                    ' lingotes hierro
                    If ObjData(nuo).LingH > 0 Then
                        MiObj.ObjIndex = 386
                        MiObj.Amount = Porcentaje(ObjData(nuo).LingH * nuoc, Esvende)

                        If MiObj.Amount < 1 Then GoTo P1
                        Call SendData(ToIndex, Userindex, 0, "|| Has ganado " & MiObj.Amount & _
                                                             " Lingotes de Hierro" & "´" & FontTypeNames.FONTTYPE_INFO)
                        'pluto:6.0A
                        Call LogNpcFundidor(UserList(Userindex).Name & " Obtiene LingH : " & MiObj.Amount)

                        If Not MeterItemEnInventario(Userindex, MiObj) Then
                            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

                        End If

                    End If    'hierro

P1:

                    ' lingotes plata
                    If ObjData(nuo).LingP > 0 Then
                        MiObj.ObjIndex = 387
                        MiObj.Amount = Porcentaje(ObjData(nuo).LingP * nuoc, Esvende)

                        If MiObj.Amount < 1 Then GoTo P2

                        Call SendData(ToIndex, Userindex, 0, "|| Has ganado " & MiObj.Amount & _
                                                             " Lingotes de Plata" & "´" & FontTypeNames.FONTTYPE_INFO)
                        'pluto:6.0A
                        Call LogNpcFundidor(UserList(Userindex).Name & " Obtiene LingP : " & MiObj.Amount)

                        If Not MeterItemEnInventario(Userindex, MiObj) Then
                            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

                        End If

                    End If    'plata

P2:

                    ' lingotes oro
                    If ObjData(nuo).LingO > 0 Then
                        MiObj.ObjIndex = 388
                        MiObj.Amount = Porcentaje(ObjData(nuo).LingO * nuoc, Esvende)

                        If MiObj.Amount < 1 Then GoTo P3

                        Call SendData(ToIndex, Userindex, 0, "|| Has ganado " & MiObj.Amount & " Lingotes de Oro" _
                                                             & "´" & FontTypeNames.FONTTYPE_INFO)
                        'pluto:6.0A
                        Call LogNpcFundidor(UserList(Userindex).Name & " Obtiene LingO : " & MiObj.Amount)

                        If Not MeterItemEnInventario(Userindex, MiObj) Then
                            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

                        End If

                    End If    'oro

P3:
                    Call SendData(ToIndex, Userindex, 0, "||5°" & "He fundido el objeto!!." & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)

                End If

            Case 31
                'pluto.6.0A-------------
                Dim nx As Byte

                If UserList(Userindex).GuildInfo.EsGuildLeader = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||5°" & "No eres Lider de Clan!!." & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)
                    Exit Sub

                End If

                'nx = UserList(userindex).GuildRef.Nivel
                Call SendData(ToIndex, Userindex, 0, "||5°" & "Para subir tu clan al Nivel ." & UserList( _
                                                     Userindex).GuildRef.Nivel + 1 & " escribe /NIVELCLAN." & "°" & Npclist( _
                                                     TempCharIndex).Char.CharIndex)
                Exit Sub

                '---------------------
                'pluto.6.0A----------------------------------------------------
            Case 32

                'pluto:6.9
                If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 And UserList(Userindex).flags.Morph = 0 And _
                   UserList(Userindex).flags.Angel = 0 And UserList(Userindex).flags.Demonio = 0 Then
                    Dim Arm As ObjData
                    Dim Slot As Byte
                    Arm = ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex)
                    Slot = UserList(Userindex).Invent.WeaponEqpSlot

                    'comprobamos si tiene la piedra onice
                    If TieneObjetos(1170, 1, Userindex) And Arm.ArmaNpc > 0 Then
                        Call QuitarUserInvItem(Userindex, Slot, 1)
                        Call UpdateUserInv(False, Userindex, Slot)

                        Call QuitarObjetos(1170, 1, Userindex)

                        MiObj.Amount = 1
                        MiObj.ObjIndex = Arm.ArmaNpc

                        If Not MeterItemEnInventario(Userindex, MiObj) Then
                            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

                        End If

                        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 109)
                        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList( _
                                                                                             Userindex).Char.CharIndex & "," & 128 & "," & 1)

                        Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                             "Perfecto!! Ha sido un placer hacer negocios contigo." & "°" & Npclist( _
                                                             TempCharIndex).Char.CharIndex)

                        Exit Sub

                    End If

                Else
                    Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                         "Hola Aodraguero, para mejorarte un Arma necesito que me traigas una Piedra Mágica, que tengas el arma equipada y que no estes transformado." _
                                                         & "°" & Npclist(TempCharIndex).Char.CharIndex)
                    Exit Sub

                End If

                Exit Sub

                'pluto:6.0A
            Case 39

                If TieneObjetos(414, 100, Userindex) Then
                    Call QuitarObjetos(414, 100, Userindex)
                    Call AddtoVar(UserList(Userindex).Stats.GLD, 10000, MAXORO)
                    Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                         "Perfecto!! Ha sido un placer hacer negocios contigo." & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)
                    Call SendData(ToIndex, Userindex, 0, "||Has ganado 10000 Oros!!" & "´" & _
                                                         FontTypeNames.FONTTYPE_INFO)
                    Call SendUserStatsOro(Userindex)
                Else
                    Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                         "Vuelve cuando tengas 100 Pieles de Lobo o 100 Botas Rotas y te recompensaré con 10000 oros." _
                                                         & "°" & Npclist(TempCharIndex).Char.CharIndex)

                End If

                If TieneObjetos(887, 10000, Userindex) Then
                    Call QuitarObjetos(887, 10000, Userindex)
                    Call AddtoVar(UserList(Userindex).Stats.GLD, 1000000, MAXORO)
                    Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                         "Perfecto!! Ha sido un placer hacer negocios contigo." & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)
                    Call SendData(ToIndex, Userindex, 0, "||Has ganado 10000 Oros!!" & "´" & _
                                                         FontTypeNames.FONTTYPE_INFO)
                    Call SendUserStatsOro(Userindex)
                Else
                    Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                         "Vuelve cuando tengas 100 Pieles de Lobo o 100 Botas Rotas y te recompensaré con 10000 oros." _
                                                         & "°" & Npclist(TempCharIndex).Char.CharIndex)

                End If

                Exit Sub

                'pluto:6.5
            Case 40    'torneo parejas

                If MapInfo(34).NumUsers < 3 Then

                    'comprueba situación pareja
                    If MapData(34, 22, 69).Userindex > 0 And MapData(34, 24, 69).Userindex > 0 Then
                        Dim Pareja1 As Integer
                        Dim Pareja2 As Integer
                        Dim r10
                        Dim y10
                        r10 = RandomNumber(52, 71)
                        y10 = RandomNumber(44, 59)
                        Pareja1 = MapData(34, 22, 69).Userindex
                        Pareja2 = MapData(34, 24, 69).Userindex
                        Call WarpUserChar(Pareja1, 291, r10, y10, True)
                        Call WarpUserChar(Pareja2, 291, r10 + 1, y10, True)
                        UserList(Pareja2).flags.ParejaTorneo = Pareja1
                        UserList(Pareja1).flags.ParejaTorneo = Pareja2
                        'pluto:6.3---
                        Call SendData(ToMap, Userindex, 0, "La Pareja formada por " & Pareja1 & " y " & Pareja2 & _
                                                           " ha entrado a la sala de Torneo Parejas" & "´" & FontTypeNames.FONTTYPE_talk)
                        '-------------
                    Else
                        Call SendData(ToIndex, Userindex, 0, "||5°" & "Colocaros uno a cada lado." & "°" & _
                                                             Npclist(TempCharIndex).Char.CharIndex)

                    End If

                Else
                    Call SendData(ToIndex, Userindex, 0, "||5°" & "Mapa ocupado, intentalo más tarde." & "°" & _
                                                         Npclist(TempCharIndex).Char.CharIndex)

                End If

                Exit Sub

                'pluto:2.24-----------------------
            Case 27

                If TieneObjetos(NumeroObjEvento, CantEntregarObjEvento, Userindex) Then
                    Call QuitarObjetos(NumeroObjEvento, CantEntregarObjEvento, Userindex)
                    Dim DazA As Byte
                    Dim ObjGanado As Integer
                    DazA = RandomNumber(1, 100)

                    Select Case DazA

                    Case Is < 25
                        ObjGanado = ObjRecompensaEventos(1)

                    Case 25 To 50
                        ObjGanado = ObjRecompensaEventos(2)

                    Case 51 To 75
                        ObjGanado = ObjRecompensaEventos(3)

                    Case 76 To 100
                        ObjGanado = ObjRecompensaEventos(4)

                    End Select

                    MiObj.Amount = CantObjRecompensa
                    MiObj.ObjIndex = ObjGanado

                    If Not MeterItemEnInventario(Userindex, MiObj) Then
                        Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

                    End If

                    Call SendData(ToIndex, Userindex, 0, "||5°" & "Muy bién!! me quedo con " & _
                                                         CantEntregarObjEvento & " " & ObjData(NumeroObjEvento).Name & _
                                                         " ¿Te gusta la recompensa? si quieres más visitame de nuevo." & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)

                Else    ' NO TIENE SUFICIENTE
                    Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                         "Para recibir tu recompensa necesito que me traigas al menos " & _
                                                         CantEntregarObjEvento & " " & ObjData(NumeroObjEvento).Name & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)

                End If

                Exit Sub

                'pluto:6.0A
            Case 3
                UserList(Userindex).flags.TargetNpc = TempCharIndex
                Call EnviarListaCriaturas(Userindex, UserList(Userindex).flags.TargetNpc)
                Exit Sub

            Case 30
                UserList(Userindex).flags.TargetNpc = TempCharIndex
                Call IniciarBovedaClan(Userindex)
                Exit Sub

                '----------click npc niñera---------------------
            Case 23

                'tiempo embarazo
                If UserList(Userindex).Embarazada >= TimeEmbarazo Then

                    Dim Tindex As Integer
                    Tindex = NameIndex(UserList(Userindex).Esposa)

                    If Tindex = 0 Then
                        Call SendData(ToIndex, Userindex, 0, "||5°" & "Tu pareja debe estar presente!!" & "°" & _
                                                             Npclist(TempCharIndex).Char.CharIndex)
                        Exit Sub

                    End If

                    If Distancia(UserList(Userindex).Pos, UserList(Tindex).Pos) < 12 Then
                        'tiene el niño
                        Call SendData(ToIndex, Userindex, 0, "Z5")
                        Exit Sub
                    Else
                        Call SendData(ToIndex, Userindex, 0, "||5°" & "Tu pareja debe estar presente!!" & "°" & _
                                                             Npclist(TempCharIndex).Char.CharIndex)
                        Exit Sub

                    End If

                Else
                    Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                         "No estás en condiciones de tener un bebé en estos momentos." & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)

                End If

                Exit Sub

                '------------
                'pluto:2.4.1
            Case 20

                If fortaleza <> UserList(Userindex).GuildInfo.GuildName Then Exit Sub
                Dim df As Integer

                If UserList(Userindex).Pos.X > Npclist(TempCharIndex).Pos.X Then df = 74 Else df = 80
                Call WarpUserChar(Userindex, 186, df, 71, True)

                'pluto:6.0A
            Case 38

                If UserList(Userindex).GuildInfo.GuildName = "" Then
                    Call SendData(ToIndex, Userindex, 0, "||6°" & _
                                                         "No te puedo ayudar. No perteneces a ningún Clan." & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)
                    Exit Sub

                End If

                If UserList(Userindex).GuildRef.SalaClan = 0 Then
                    Call SendData(ToIndex, Userindex, 0, "||6°" & _
                                                         "No te puedo ayudar. Tú clan no tiene Sala de Clan." & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)
                    Exit Sub

                End If

                Call WarpUserChar(Userindex, UserList(Userindex).GuildRef.SalaClan, 53, 71, True)
                Exit Sub

            End Select

            'comerciar
            '¿El NPC puede comerciar?
            If Npclist(TempCharIndex).Comercia > 0 Then

                'if UserList(UserIndex).flags.Comerciando = True then exit sub
                'Iniciamos la rutina pa' comerciar.
                'pluto:2.17
                If Npclist(TempCharIndex).TipoItems = 888 And UserList(Userindex).Faccion.ArmadaReal = 0 Then
                    'Call SendData(ToIndex, UserIndex, 0, "S3")
                    Call SendData(ToIndex, Userindex, 0, "||6°" & "Sólo comercio con miembros de la Armada Real." & _
                                                         "°" & Npclist(TempCharIndex).Char.CharIndex)
                    Exit Sub

                End If

                UserList(Userindex).flags.TargetNpcTipo = Npclist(TempCharIndex).NPCtype
                UserList(Userindex).flags.TargetNpc = TempCharIndex
                Call IniciarCOmercioNPC(Userindex)
                Exit Sub

            End If

            If Len(Npclist(TempCharIndex).Desc) > 1 Then

                'pluto:hoy
                If Npclist(TempCharIndex).NPCtype = 15 Then Call SendData(ToPCArea, Userindex, Npclist( _
                                                                                               TempCharIndex).Pos.Map, "||8°" & PreTrivial & "°" & Npclist(TempCharIndex).Char.CharIndex)

                If Npclist(TempCharIndex).NPCtype = 16 Then Call SendData(ToIndex, Userindex, 0, "||8°" & PreEgipto & _
                                                                                                 "°" & Npclist(TempCharIndex).Char.CharIndex)

                If Npclist(TempCharIndex).NPCtype <> 22 And Npclist(TempCharIndex).NPCtype <> 15 And Npclist( _
                   TempCharIndex).NPCtype <> 16 Then Call SendData(ToIndex, Userindex, 0, "||5°" & Npclist( _
                                                                                          TempCharIndex).Desc & "°" & Npclist(TempCharIndex).Char.CharIndex)

                'pluto:2.14
                If Npclist(TempCharIndex).NPCtype = 22 Then Call SendData(ToIndex, Userindex, 0, "||5°" & _
                                                                                                 "Escribe /Torneo son 100 oros.Hay " & MapInfo(194).NumUsers & _
                                                                                                 " Jugadores en la sala y un Bote de " & TorneoBote & " Oros. No se caen los objetos." & "°" & _
                                                                                                 Npclist(TempCharIndex).Char.CharIndex)
                '------------

                'pluto:2.3
                If Npclist(TempCharIndex).NPCtype = 19 Then
                    Dim UserFile As String
                    UserFile = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"

                    For X = 1 To 12

                        'If GetVar(UserFile, "MONTURA", "NIVEL" & x) > 0 Then
                        If UserList(Userindex).Montura.Nivel(X) > 0 Then
                            If Not TieneObjetos(X + 887, 1, Userindex) Then

                                'pluto:2.4.1
                                'If UserList(UserIndex).Stats.GLD < 1000 Then
                                'Call SendData(ToIndex, UserIndex, 0, "||No tienes suficiente Oro" & FONTTYPENAMES.FONTTYPE_INFO)
                                'Exit Sub
                                'End If
                                'UserList(UserIndex).Stats.GLD = UserList(UserIndex).Stats.GLD - 1000
                                'Call SendUserStatsOro(UserIndex)
                                'Dim Miobj As obj
                                MiObj.Amount = 1
                                MiObj.ObjIndex = X + 887
                                Call LogMascotas("Recupera Cuidadora: " & UserList(Userindex).Name & " Objeto " & _
                                                 MiObj.ObjIndex)

                                If Not MeterItemEnInventario(Userindex, MiObj) Then
                                    Call SendData(ToIndex, Userindex, 0, "||No tienes sitio en el inventario" & "´" & _
                                                                         FontTypeNames.FONTTYPE_INFO)

                                End If

                            End If

                        End If

                    Next X

                End If

                'FIN PLUTO:2.3
            Else

                If Npclist(TempCharIndex).MaestroUser > 0 Then
                    Call SendData(ToIndex, Userindex, 0, "|| " & Npclist(TempCharIndex).Name & " es mascota de " & _
                                                         UserList(Npclist(TempCharIndex).MaestroUser).Name & "´" & FontTypeNames.FONTTYPE_INFO)

                    'pluto:2.4

                    If Npclist(TempCharIndex).NPCtype = 60 Then

                        Dim xx As Integer
                        xx = UserList(Userindex).flags.ClaseMontura

                        If xx = 0 Then GoTo q:
                        Call SendData(ToIndex, Userindex, 0, "|| Nombre: " & UserList(Userindex).Montura.Nombre(xx) & _
                                                             "´" & FontTypeNames.FONTTYPE_INFO)
                        Call SendData(ToIndex, Userindex, 0, "|| Nivel: " & UserList(Userindex).Montura.Nivel(xx) & _
                                                             "´" & FontTypeNames.FONTTYPE_INFO)
                        Call SendData(ToIndex, Userindex, 0, "|| Exp: " & UserList(Userindex).Montura.exp(xx) & "´" & _
                                                             FontTypeNames.FONTTYPE_INFO)
                        Call SendData(ToIndex, Userindex, 0, "|| Elu: " & UserList(Userindex).Montura.Elu(xx) & "´" & _
                                                             FontTypeNames.FONTTYPE_INFO)
                        Call SendData(ToIndex, Userindex, 0, "|| Vida: " & Npclist(TempCharIndex).Stats.MinHP & " / " _
                                                             & UserList(Userindex).Montura.Vida(xx) & "´" & FontTypeNames.FONTTYPE_INFO)
                        Call SendData(ToIndex, Userindex, 0, "|| Golpe: " & UserList(Userindex).Montura.Golpe(xx) & _
                                                             "´" & FontTypeNames.FONTTYPE_INFO)

                    End If

q:
                Else

                    'pluto:6.8
                    If UserList(Userindex).flags.Privilegios > 0 Then
                        Call SendData(ToIndex, Userindex, 0, "|| " & Npclist(TempCharIndex).Name & " con " & Npclist( _
                                                             TempCharIndex).Stats.MinHP & " de vida." & "´" & FontTypeNames.FONTTYPE_INFO)
                    Else
                        Call SendData(ToIndex, Userindex, 0, "|| " & Npclist(TempCharIndex).Name & "´" & _
                                                             FontTypeNames.FONTTYPE_INFO)

                    End If

                    'Call SendData(ToIndex, UserIndex, 0, "|| " & Npclist(TempCharIndex).Name & " index:" & TempCharIndex & FONTTYPENAMES.FONTTYPE_INFO)
                End If

            End If
            
                
                
                If Npclist(TempCharIndex).Pos.Map = 203 Or Npclist(TempCharIndex).Pos.Map = 204 Then
                    Call SendData(ToIndex, Userindex, 0, "||3°" & Npclist(TempCharIndex).Stats.MinHP & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)
                End If

            '-----------fin pluto:2.4-----------------

            'Pluto:2.18 añade mapas nuevos, vida restante npc castillos
            If MapInfo(Npclist(TempCharIndex).Pos.Map).Zona = "CASTILLO" And UserList(Userindex).GuildInfo.GuildName _
               <> "" Then
                Dim castiact As String

                If Npclist(TempCharIndex).Pos.Map = mapa_castillo1 Or Npclist(TempCharIndex).Pos.Map = 268 Then _
                   castiact = castillo1

                If Npclist(TempCharIndex).Pos.Map = mapa_castillo2 Or Npclist(TempCharIndex).Pos.Map = 269 Then _
                   castiact = castillo2

                If Npclist(TempCharIndex).Pos.Map = mapa_castillo3 Or Npclist(TempCharIndex).Pos.Map = 270 Then _
                   castiact = castillo3

                If Npclist(TempCharIndex).Pos.Map = mapa_castillo4 Or Npclist(TempCharIndex).Pos.Map = 271 Then _
                   castiact = castillo4

                If Npclist(TempCharIndex).Pos.Map = 185 Then castiact = fortaleza

                If UserList(Userindex).GuildInfo.GuildName = castiact Then
                    Call SendData(ToIndex, Userindex, 0, "||3°" & Npclist(TempCharIndex).Stats.MinHP & "°" & Npclist( _
                                                         TempCharIndex).Char.CharIndex)

                End If

            End If

            FoundSomething = 1
            UserList(Userindex).flags.TargetNpcTipo = Npclist(TempCharIndex).NPCtype
            UserList(Userindex).flags.TargetNpc = TempCharIndex
            UserList(Userindex).flags.TargetUser = 0
            UserList(Userindex).flags.TargetObj = 0

        End If

AI:

        If foundchar = 0 Then
            UserList(Userindex).flags.TargetNpc = 0
            UserList(Userindex).flags.TargetNpcTipo = 0
            UserList(Userindex).flags.TargetUser = 0

        End If

        '*** NO ENCOTRO NADA ***
        If FoundSomething = 0 Then
            UserList(Userindex).flags.TargetNpc = 0
            UserList(Userindex).flags.TargetNpcTipo = 0
            UserList(Userindex).flags.TargetUser = 0
            UserList(Userindex).flags.TargetObj = 0
            UserList(Userindex).flags.TargetObjMap = 0
            UserList(Userindex).flags.TargetObjX = 0
            UserList(Userindex).flags.TargetObjY = 0

            'Call SendData(ToIndex, UserIndex, 0, "M9")
        End If

    Else

        If FoundSomething = 0 Then
            UserList(Userindex).flags.TargetNpc = 0
            UserList(Userindex).flags.TargetNpcTipo = 0
            UserList(Userindex).flags.TargetUser = 0
            UserList(Userindex).flags.TargetObj = 0
            UserList(Userindex).flags.TargetObjMap = 0
            UserList(Userindex).flags.TargetObjX = 0
            UserList(Userindex).flags.TargetObjY = 0

            'Call SendData(ToIndex, UserIndex, 0, "M9")
        End If

    End If

    Exit Sub
fallo:
    'Call LogError("LOOKATTILE" & Err.Number & " D: " & Err.Description)
    Call LogError("LOOKATTILE " & Err.number & " D: " & Err.Description & " name: " & UserList(Userindex).Name & _
                  " mapa: " & UserList(Userindex).Pos.Map & " X: " & UserList(Userindex).Pos.X & " Y: " & UserList( _
                  Userindex).Pos.Y & " RatX: " & X & " RatY: " & Y)

End Sub

Function FindDirection(Pos As WorldPos, Target As WorldPos) As Byte

'*****************************************************************
'Devuelve la direccion en la cual el target se encuentra
'desde pos, 0 si la direc es igual
'*****************************************************************
    On Error GoTo fallo

    Dim X As Integer
    Dim Y As Integer

    X = Pos.X - Target.X
    Y = Pos.Y - Target.Y

    'NE
    If Sgn(X) = -1 And Sgn(Y) = 1 Then
        FindDirection = NORTH
        Exit Function

    End If

    'NW
    If Sgn(X) = 1 And Sgn(Y) = 1 Then
        FindDirection = WEST
        Exit Function

    End If

    'SW
    If Sgn(X) = 1 And Sgn(Y) = -1 Then
        FindDirection = WEST
        Exit Function

    End If

    'SE
    If Sgn(X) = -1 And Sgn(Y) = -1 Then
        FindDirection = SOUTH
        Exit Function

    End If

    'Sur
    If Sgn(X) = 0 And Sgn(Y) = -1 Then
        FindDirection = SOUTH
        Exit Function

    End If

    'norte
    If Sgn(X) = 0 And Sgn(Y) = 1 Then
        FindDirection = NORTH
        Exit Function

    End If

    'oeste
    If Sgn(X) = 1 And Sgn(Y) = 0 Then
        FindDirection = WEST
        Exit Function

    End If

    'este
    If Sgn(X) = -1 And Sgn(Y) = 0 Then
        FindDirection = EAST
        Exit Function

    End If

    'misma
    If Sgn(X) = 0 And Sgn(Y) = 0 Then
        FindDirection = 0
        Exit Function

    End If

    Exit Function
fallo:
    Call LogError("FINDDIRECTION" & Err.number & " D: " & Err.Description)

End Function

Public Function EsObjetoFijo(ByVal OBJType As Integer) As Boolean

    EsObjetoFijo = OBJType = OBJTYPE_FOROS Or OBJType = OBJTYPE_CARTELES Or OBJType = OBJTYPE_ARBOLES Or OBJType = _
                   OBJTYPE_YACIMIENTO

End Function
