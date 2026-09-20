Attribute VB_Name = "ModBloodCastle"
Public BloodGamesAC As Boolean
Public BloodGamesESP As Boolean
Public EmpiezaBlood As Integer
Public BloodTimer As Integer

Sub BloodGames_Entra(ByVal Userindex As Integer)

    On Error GoTo errordm:

    If BloodGamesAC = False Then Exit Sub

    If BloodGamesESP = False Then
        Call SendData(ToIndex, 0, 0, "|/Blood Castle" & "> " & "El cupo de participación del evento está completo.")
        Exit Sub

    End If

    CantidadBloodGames = CantidadBloodGames + 1
    Call WarpUserChar(Userindex, 205, 24, 86, True)
    UserList(Userindex).flags.BloodGames = True

    If CantidadBloodGames = CantBloodGames Or BloodComienza = 0 Then
        Call SendData(ToAll, 0, 0, "|/Blood Castle" & "> " & "¡Comienza el evento! ¡Suerte a los participantes!")
        TiempoBlood = 120
        BloodGamesESP = False
        'Call BloodGames_Empieza
        EmpiezaBlood = 600
        BloodTimer = 1
        
    MapData(205, 37, 79).Blocked = 0
    MapData(205, 38, 79).Blocked = 0
    MapData(205, 39, 79).Blocked = 0
    MapData(205, 40, 79).Blocked = 0
    MapData(205, 41, 79).Blocked = 0
    MapData(205, 42, 79).Blocked = 0
    MapData(205, 43, 79).Blocked = 0
    MapData(205, 44, 79).Blocked = 0
    MapData(205, 45, 79).Blocked = 0
    MapData(205, 46, 79).Blocked = 0
    Call Bloquear(ToMap, 0, 205, 205, 37, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 38, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 39, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 40, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 41, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 42, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 43, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 44, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 45, 79, 0)
    Call Bloquear(ToMap, 0, 205, 205, 46, 79, 0)
    
        Dim PosBloodP As WorldPos
        PosBloodP.X = 42
        PosBloodP.Y = 40
        PosBloodP.Map = 205
    
        MapData(205, 40, 40).Blocked = 1
        MapData(205, 41, 40).Blocked = 1
        MapData(205, 43, 40).Blocked = 1
        Call Bloquear(ToMap, 0, 205, 205, 40, 40, 1)
        Call Bloquear(ToMap, 0, 205, 205, 41, 40, 1)
        Call Bloquear(ToMap, 0, 205, 205, 43, 40, 1)
    
        Dim PosBloodR As WorldPos
        PosBloodR.X = 42
        PosBloodR.Y = 17
        PosBloodR.Map = 205

        Call SpawnNpc(779, PosBloodP, True, False)
        Call SpawnNpc(778, PosBloodR, True, False)

    End If

errordm:

End Sub

Sub BloodGames_Comienza(ByVal wetas As Integer)

    On Error GoTo errordm

    If BloodGamesAC = True Then
        Call SendData(ToAdmins, 0, 0, "|/Blood Castle" & "> " & "Ya hay un evento de este tipo en curso.")
        Exit Sub

    End If

    If BloodGamesESP = True Then
        Call SendData(ToIndex, 0, 0, "|/Blood Castle" & "> " & "¡El evento ha comenzado!")
        Exit Sub

    End If

    CantBloodGames = wetas

    Call SendData(ToAll, 0, 0, "|/Blood Castle" & "> " & "Podrán entrar [" & CantBloodGames & _
                               "] jugadores ¡Si deseas ingresar envía /BLOODCASTLE!")
    MapData(205, 37, 79).Blocked = 1
    MapData(205, 38, 79).Blocked = 1
    MapData(205, 39, 79).Blocked = 1
    MapData(205, 40, 79).Blocked = 1
    MapData(205, 41, 79).Blocked = 1
    MapData(205, 42, 79).Blocked = 1
    MapData(205, 43, 79).Blocked = 1
    MapData(205, 44, 79).Blocked = 1
    MapData(205, 45, 79).Blocked = 1
    MapData(205, 46, 79).Blocked = 1
    Call Bloquear(ToMap, 0, 205, 205, 37, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 38, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 39, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 40, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 41, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 42, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 43, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 44, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 45, 79, 1)
    Call Bloquear(ToMap, 0, 205, 205, 46, 79, 1)
    
    Dim PosBloodB As WorldPos
    PosBloodB.X = 30
    PosBloodB.Y = 80
    PosBloodB.Map = 205
    Call SpawnNpc(24, PosBloodB, True, False)
    Call SpawnNpc(14, PosBloodB, True, False)

    BloodGamesAC = True
    BloodGamesESP = True

errordm:

End Sub

Sub BloodGames_Ganan()

    On Error GoTo errordm

    'If BloodGamesAC = False And BloodGamesESP = False Then
        'Exit Sub

    'End If

                TerminoBloodGames = False
                BloodGamesESP = False
                BloodGamesAC = False
                CantidadBloodGames = 0
                TiempoBlood = 0
                EmpiezaBlood = 0
                BloodTimer = 0
                BloodComienza = 150

    CantidadHBloodGames = 0
    Call SendData(ToAll, 0, 0, "|/Blood Castle" & "> " & "Felicidades a nuestros nobles Guerreros, el rey de Archavon fue derrotado, tomen sus recompensas.")

    Dim loopc As Integer

    For loopc = 1 To LastUser

        If UserList(loopc).flags.BloodGames = True And UserList(loopc).Pos.Map = 205 Then
            UserList(loopc).Stats.Puntos = UserList(loopc).Stats.Puntos + 150
            Call SendData(ToIndex, loopc, 0, "|/Blood Castle" & "> " & "Has ganado 150 Puntos de Canje, felicidades Noble Guerrero.")
            Call WarpUserChar(loopc, 34, 50, 50, True)
            UserList(loopc).flags.BloodGames = False
            Dim PuntosC As Integer
            PuntosC = UserList(loopc).Stats.Puntos
            Call SendData(ToIndex, loopc, 0, "J5" & PuntosC)

        End If


    Next
errordm:


End Sub

Sub BloodGames_Muere(ByVal Userindex As Integer)

    On Error GoTo errord

    CantidadBloodGames = CantidadBloodGames - 1
    Dim MiObj As obj

    If CantidadBloodGames = 0 Or MapInfo(205).NumUsers = 0 Then
        TerminoBloodGames = True
        'Dim loopc As Integer

        'For loopc = 1 To LastUser

            'If UserList(loopc).flags.BloodGames = True And UserList(loopc).Pos.Map = 205 Then
                Call SendData(ToAll, 0, 0, "|/Blood Castle" & "> " & _
                                                 "¡El mal triunfó sobre nuestro mundo.. Hemos perdido a todos nuestros guerrero en Blood Castle!")
                'Call SendData(ToAll, 0, 0, "|/Blood Castl" & "> ¡" & UserList(loopc).Name & _
                                           " ganó los Juegos del Hambre!")
                'UserList(loopc).Stats.Puntos = UserList(loopc).Stats.Puntos + 100
                'Call WarpUserChar(loopc, 34, 50, 50, True)
                
                'Dim PuntosC As Integer
                'PuntosC = UserList(Userindex).Stats.Puntos
                'Call SendData(ToIndex, loopc, 0, "J5" & PuntosC)


                'UserList(loopc).flags.HungerGames = False
            If TerminoBloodGames = True Then
            For Y = 1 To 100
            For X = 1 To 100
                If MapData(205, X, Y).NpcIndex > 0 Then
                    'If Npclist(MapData(CiudadGuerra, X, Y).NpcIndex).numero = NPCGuerra Then
                Call QuitarNPC(MapData(205, X, Y).NpcIndex)
                    'End If
                'End If

            End If
                    Next X
                    Next Y
            End If
                TerminoBloodGames = False
                BloodGamesESP = False
                BloodGamesAC = False
                CantidadBloodGames = 0
                TiempoBlood = 0
                EmpiezaBlood = 0
                BloodTimer = 0
                BloodComienza = 150

            End If

        'Next

    'End If

    'If CantidadHungerGames = 0 Or MapInfo(7).NumUsers = 0 Then
    'TerminoHungerGames = False
    'HungerGamesESP = False
    'HungerGamesAC = False
    'CantidadHungerGames = 0
    'Call SendData(ToAll, 0, 0, "|/Juegos del Hambre" & "> " & "¡El ganador se ha desconectado o muerto! ¡Que lastima!")
    'End If

errord:

End Sub

Sub BloodGames_Cancela()

    On Error GoTo errordm

    If BloodGamesAC = False And BloodGamesESP = False Then
        Exit Sub

    End If

                TerminoBloodGames = False
                BloodGamesESP = False
                BloodGamesAC = False
                CantidadBloodGames = 0
                TiempoBlood = 0
                EmpiezaBlood = 0
                BloodTimer = 0
                BloodComienza = 150

    CantidadHBloodGames = 0
    Call SendData(ToAll, 0, 0, "|/Blood Castle" & "> " & "El evento ha sido cancelado.")

    Dim loopc As Integer

    For loopc = 1 To LastUser

        If UserList(loopc).flags.BloodGames = True And UserList(loopc).Pos.Map = 205 Then
            Call WarpUserChar(loopc, 34, 50, 50, True)
            UserList(loopc).flags.BloodGames = False

        End If

    Next
errordm:

End Sub

Sub BloodGamesAuto_Cancela()

    On Error GoTo errordm

    If BloodGamesAC = False And BloodGamesESP = False Then
        Exit Sub

    End If

                TerminoBloodGames = False
                BloodGamesESP = False
                BloodGamesAC = False
                CantidadBloodGames = 0
                TiempoBlood = 0
                EmpiezaBlood = 0
                BloodTimer = 0
                BloodComienza = 150
                
    Call SendData(ToAll, 0, 0, "|/Blood Castle" & "> " & "El evento ha sido cancelado.")

    Dim loopc As Integer

    For loopc = 1 To LastUser

        If UserList(loopc).flags.BloodGames = True And UserList(loopc).Pos.Map = 205 Then
            Call WarpUserChar(loopc, 34, 50, 50, True)
            UserList(loopc).flags.BloodGames = False

        End If

    Next
errordm:

End Sub

Sub BloodGames_Empieza()

Dim PosBlood As WorldPos

Dim loopc As Integer
Dim NPCInvocado As Integer

    For loopc = 1 To LastUser
    
    If UserList(loopc).Pos.Map = 205 And UserList(loopc).flags.BloodGames = True And EmpiezaBlood > 350 Then
        NPCInvocado = RandomNumber(1, 18)
        'Debug.Print NPCInvocado
        If NPCInvocado = 9 Then
            Call SpawnNpc(772, UserList(loopc).Pos, True, False)
        ElseIf NPCInvocado = 8 Then
            Call SpawnNpc(773, UserList(loopc).Pos, True, False)
        ElseIf NPCInvocado = 7 Then
            Call SpawnNpc(774, UserList(loopc).Pos, True, False)
        End If
    End If
    
        If UserList(loopc).Pos.Map = 205 And UserList(loopc).flags.BloodGames = True And EmpiezaBlood < 350 Then
        NPCInvocado = RandomNumber(1, 20)
        If NPCInvocado = 9 Then
            Call SpawnNpc(775, UserList(loopc).Pos, True, False)
        ElseIf NPCInvocado = 8 Then
            Call SpawnNpc(776, UserList(loopc).Pos, True, False)
        ElseIf NPCInvocado = 7 Then
            Call SpawnNpc(777, UserList(loopc).Pos, True, False)
        End If
    End If
    
    Next loopc
    

If EmpiezaBlood = 0 Then
Call BloodGames_Cancela
End If



End Sub
