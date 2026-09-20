Attribute VB_Name = "Mod_Arena"
Option Explicit

Private Const TIME_LIFE_BATTLE          As Integer = 600 ' Segundos = 10 Minutos.
Private Const TIME_COUNT_DOWN           As Integer = 10  ' Segundos.
Private Const NOT_FREE_BATTLE_ARENA     As Integer = -1  ' Slot Invalido, por lo tanto no lo manda a la arena.
Private Const BASE_AMOUNT_ROUNDS_TO_WIN As Integer = 2   ' Necesita ganar 2 RONDAS para salir  victorioso.
Private Const MIN_AMOUNT_POINTS_ELO     As Integer = 10  ' Minimo de ELO que da ganar o quita al perder.
Private Const MAX_AMOUNT_POINTS_ELO     As Integer = 40  ' Maximo de ELO que da ganar o quita al perder.

Public Enum eRank
    e_BRONCE = 0
    e_PLATA = 1
    e_ORO = 2
    e_PLATINO = 3
    e_DIAMANTE = 4
    e_LAST = 5
End Enum

Private Type tTime
    CountDown As Long
    LifeBattle As Long
End Type

Private Type Winners
    FirstUser As Integer
    SecondUser As Integer
End Type

Private Type ArenaData
    Rounds As Byte
    Start As Boolean
    Used As Boolean
    ELO_Winner As Integer
    ELO_Losser As Integer
    AttackerIndex As Integer
    VictimIndex As Integer
    Map As Integer
    RoundCant As Integer
    RoundWinners As Winners
    Timing As tTime
    First As Position
    Second As Position
End Type

Private Type ArenaInfo
    MaxBattleArena(0 To eRank.e_LAST - 1) As Long
    data() As ArenaData
End Type

Private BattleArena(eRank.e_BRONCE To eRank.e_LAST - 1) As ArenaInfo
Private BattleArenaActive                               As Boolean

Public Function GetBattleArenaActive() As Boolean

    GetBattleArenaActive = BattleArenaActive
    
End Function

Public Sub LoadBattleArena()
   
    Dim tStr    As String
    Dim i       As Long
    Dim J       As Long
    Dim value   As Long
    Dim ReadIni As New clsIniManager
    
    Call ReadIni.Initialize(DatPath & "BattleArena.dat")
    
    BattleArenaActive = (val(ReadIni.GetValue("INIT", "Active")) = 1)
    
    If BattleArenaActive Then
    
        For i = eRank.e_BRONCE To eRank.e_LAST - 1

            With BattleArena(i)
                value = CLng(ReadIni.GetValue("INIT", "MaxBattles" & i))
                .MaxBattleArena(i) = value
                ReDim Preserve .data(1 To value) As ArenaData

                For J = 1 To value

                    With .data(J)
                        tStr = ReadIni.GetValue("ARENA" & i, "BattleArena" & (J - 1))
                        .Map = CInt(ReadField(1, tStr, 45))
                        .First.X = CInt(ReadField(2, tStr, 45))
                        .First.Y = CInt(ReadField(3, tStr, 45))
                        .Second.X = CInt(ReadField(4, tStr, 45))
                        .Second.Y = CInt(ReadField(5, tStr, 45))
                    End With
                    
                Next J

            End With
        Next i

    End If
    
    Set ReadIni = Nothing
    Exit Sub

End Sub

Private Function GetArenaBattle(ByVal Rank As eRank) As Long

    Dim i As Long

    With BattleArena(Rank)

        For i = 1 To .MaxBattleArena(Rank)
            If Not .data(i).Used Then
                GetArenaBattle = i
                Exit Function
            End If
        Next i

    End With
    
    GetArenaBattle = NOT_FREE_BATTLE_ARENA
    Exit Function
    
End Function

Private Function ClearArenaBattle(ByVal Rank As eRank, ByVal BattleArenaSlot As Integer)

    ' Reset Data
    With BattleArena(Rank).data(BattleArenaSlot)
        .Start = False
        .Used = False
        .Rounds = 0
        .AttackerIndex = 0
        .VictimIndex = 0
        .ELO_Losser = 0
        .ELO_Winner = 0
        .RoundCant = 0
        .RoundWinners.FirstUser = 0
        .RoundWinners.SecondUser = 0
        .Timing.CountDown = 0
        .Timing.LifeBattle = 0
    End With

End Function

Public Function SendToUsersInQueue(ByVal QueueRank As eRank, _
                                   ByVal FirstUser As Integer, _
                                   ByVal SecondUser As Integer, _
                                   Optional ByVal Rounds As Integer = BASE_AMOUNT_ROUNDS_TO_WIN) As Boolean
        '<EhHeader>
        On Error GoTo SendToUsersInQueue_Err
        '</EhHeader>

100     SendToUsersInQueue = False
        Dim Slot As Long
    
102     Slot = GetArenaBattle(QueueRank)
    
104     If Slot = 0 Or Slot = NOT_FREE_BATTLE_ARENA Then
            Exit Function
        End If
    
106     With BattleArena(QueueRank).data(Slot)
108         .Rounds = 1
110         .AttackerIndex = FirstUser
112         .VictimIndex = SecondUser
114         .Start = False
116         .Used = True
118         .ELO_Losser = RandomNumber(MIN_AMOUNT_POINTS_ELO, MAX_AMOUNT_POINTS_ELO)
120         .ELO_Winner = RandomNumber(MIN_AMOUNT_POINTS_ELO, MAX_AMOUNT_POINTS_ELO)
122         .RoundCant = Rounds
124         .RoundWinners.FirstUser = 0
126         .RoundWinners.SecondUser = 0
128         .Timing.CountDown = TIME_COUNT_DOWN
130         .Timing.LifeBattle = 0
        
            ' Seteo Data
132         With UserList(FirstUser)
134             .flags.ArenaBattleSlot = Slot
136             .flags.QueueArena = 0
138             .PoSum.Map = .Pos.Map
140             .PoSum.X = .Pos.X
142             .PoSum.Y = .Pos.Y
            End With
         
            ' Seteo Data
144         With UserList(SecondUser)
146             .flags.ArenaBattleSlot = Slot
148             .flags.QueueArena = 0
150             .PoSum.Map = .Pos.Map
152             .PoSum.X = .Pos.X
154             .PoSum.Y = .Pos.Y
            End With
        
            ' Dejo que no se puedan mover.
156         Call SendData2(ToIndex, .AttackerIndex, 0, 119)
158         Call SendData2(ToIndex, .VictimIndex, 0, 119)
        
            ' Transporto a la posicion.
160         Call WarpUserChar(.AttackerIndex, .Map, .First.X, .First.Y, True)
162         Call WarpUserChar(.VictimIndex, .Map, .Second.X, .Second.Y, True)
        End With
    
164     SendToUsersInQueue = True
        '<EhFooter>
        Exit Function

SendToUsersInQueue_Err:
        Call LogRanked(Err.Description & " in SendToUsersInQueue at line " & Erl)

        '</EhFooter>
End Function

Public Sub RankedUserWinnerRound(ByVal DeadIndex As Integer, ByVal Slot As Integer)
        '<EhHeader>
        On Error GoTo RankedUserWinnerRound_Err
        '</EhHeader>

        Dim Rank            As eRank
        Dim ExistenceWinner As Boolean
    
100     Rank = GetUserRank(DeadIndex)

102     With BattleArena(Rank).data(Slot)
        
            ' Si el DeadIndex es igual al primer char. sumamos al segundo.
104         If DeadIndex = .AttackerIndex Then
106             .RoundWinners.SecondUser = .RoundWinners.SecondUser + 1
108             ExistenceWinner = (.RoundWinners.SecondUser = .RoundCant)
            Else
112             .RoundWinners.FirstUser = .RoundWinners.FirstUser + 1
114             ExistenceWinner = (.RoundWinners.FirstUser = .RoundCant)
            End If
                
118         If ExistenceWinner Then
120             Call RankedTerminate(Rank, Slot)
            Else
                ' Pongo en false, para que empiece la cuenta regresiva de nuevo.
122             .Start = False
124             .Timing.CountDown = TIME_COUNT_DOWN

                UserList(.VictimIndex).Stats.MinHP = UserList(.VictimIndex).Stats.MaxHP
                UserList(.AttackerIndex).Stats.MinHP = UserList(.AttackerIndex).Stats.MaxHP
          
                ' Dejo que no se puedan mover.
126             Call SendData2(ToIndex, .AttackerIndex, 0, 119)
128             Call SendData2(ToIndex, .VictimIndex, 0, 119)
        
                ' Transporto a la posicion.
130             Call WarpUserChar(.AttackerIndex, .Map, .First.X, .First.Y, True)
132             Call WarpUserChar(.VictimIndex, .Map, .Second.X, .Second.Y, True)
            End If
        
        End With
    
        '<EhFooter>
        Exit Sub

RankedUserWinnerRound_Err:
        Call LogRanked(Err.Description & " in RankedUserWinnerRound at line " & Erl)

        '</EhFooter>
End Sub

Public Sub RankedTerminate(ByVal Rank As eRank, _
                           ByVal Slot As Integer, _
                           Optional ByVal ByTime As Boolean = False, _
                           Optional ByVal DisconnectUser As Integer = 0)

        '<EhHeader>
        On Error GoTo RankedTerminate_Err

        '</EhHeader>
  
        Dim nPos      As WorldPos
        Dim Disconnet As Integer
    
100     With BattleArena(Rank).data(Slot)

            ' Si se desconecto alguno de los 2 usuarios. PIERDE y GANA el otro automaticamente.
            If DisconnectUser > 0 Then
                If DisconnectUser = .AttackerIndex Then
                    .RoundWinners.SecondUser = .RoundCant
                Else
                    .RoundWinners.FirstUser = .RoundCant
                End If
            End If
            
102         If Not ByTime Then
        
                'Conexion activa?
104             If UserList(.AttackerIndex).ConnID <> -1 Then

                    '¿User valido?
106                 If UserList(.AttackerIndex).ConnIDValida And UserList(.AttackerIndex).flags.UserLogged Then

108                     If .RoundWinners.FirstUser = .RoundCant Then
110                         Call WriteConsoleMsg(.AttackerIndex, "Has Ganado el reto contra :" & UserList(.VictimIndex).Name, FontTypeNames.FONTTYPE_FIGHT)
112                         UserList(.AttackerIndex).Stats.Elo = UserList(.AttackerIndex).Stats.Elo + .ELO_Winner
                            Call WriteConsoleMsg(.AttackerIndex, "Has Ganado " & .ELO_Winner & " Puntos de Elo.", FontTypeNames.FONTTYPE_FIGHT)
                            Call SendUserStatsEXP(.AttackerIndex)
                        Else
114                         Call WriteConsoleMsg(.AttackerIndex, "Has perdido el reto contra :" & UserList(.VictimIndex).Name, FontTypeNames.FONTTYPE_FIGHT)
116                         UserList(.AttackerIndex).Stats.Elo = UserList(.AttackerIndex).Stats.Elo - .ELO_Losser
                            Call WriteConsoleMsg(.AttackerIndex, "Has Perdido " & .ELO_Losser & " Puntos de Elo.", FontTypeNames.FONTTYPE_FIGHT)
                            Call SendUserStatsEXP(.AttackerIndex)
                            
                            
                            ' No puede tener menos de 0 de ELO
118                         If UserList(.AttackerIndex).Stats.Elo < 0 Then
120                             UserList(.AttackerIndex).Stats.Elo = 1
                                Call SendUserStatsEXP(.AttackerIndex)
                            End If
                        
                        End If
               
                    End If
                End If
            
                'Conexion activa?
122             If UserList(.VictimIndex).ConnID <> -1 Then
                    '¿User valido?
124                 If UserList(.VictimIndex).ConnIDValida And UserList(.VictimIndex).flags.UserLogged Then

126                     If .RoundWinners.SecondUser = .RoundCant Then
128                         Call WriteConsoleMsg(.VictimIndex, "Has Ganado el reto contra :" & UserList(.AttackerIndex).Name, FontTypeNames.FONTTYPE_FIGHT)
130                         UserList(.VictimIndex).Stats.Elo = UserList(.VictimIndex).Stats.Elo + .ELO_Winner
                            Call WriteConsoleMsg(.AttackerIndex, "Has Ganado " & .ELO_Winner & " Puntos de Elo.", FontTypeNames.FONTTYPE_FIGHT)
                            Call SendUserStatsEXP(.VictimIndex)
                        Else
132                         Call WriteConsoleMsg(.VictimIndex, "Has perdido el reto contra :" & UserList(.AttackerIndex).Name, FontTypeNames.FONTTYPE_FIGHT)
134                         UserList(.VictimIndex).Stats.Elo = UserList(.VictimIndex).Stats.Elo - .ELO_Losser
                            Call WriteConsoleMsg(.VictimIndex, "Has Perdido " & .ELO_Losser & " Puntos de Elo.", FontTypeNames.FONTTYPE_FIGHT)
                            Call SendUserStatsEXP(.VictimIndex)
                            
                            ' No puede tener menos de 0 ed ELO
136                         If UserList(.VictimIndex).Stats.Elo < 0 Then
138                             UserList(.VictimIndex).Stats.Elo = 1
                                Call SendUserStatsEXP(.VictimIndex)
                            End If
                   
                        End If
                    End If
                End If
                
            Else
140             Call WriteConsoleMsg(.AttackerIndex, "Los 10 minutos se han agotado, es un empate!!.", FontTypeNames.FONTTYPE_FIGHT)
142             Call WriteConsoleMsg(.VictimIndex, "Los 10 minutos se han agotado, es un empate!!.", FontTypeNames.FONTTYPE_FIGHT)
            End If
        
144         UserList(.AttackerIndex).flags.ArenaBattleSlot = 0
146         UserList(.VictimIndex).flags.ArenaBattleSlot = 0
        
148         Call ClosestLegalPos(UserList(.AttackerIndex).PoSum, nPos, 0)
150         If nPos.X <> 0 And nPos.Y <> 0 Then
152             Call WarpUserChar(.AttackerIndex, nPos.Map, nPos.X, nPos.Y, True)
            End If
        
154         Call ClosestLegalPos(UserList(.VictimIndex).PoSum, nPos, 0)
156         If nPos.X <> 0 And nPos.Y <> 0 Then
158             Call WarpUserChar(.VictimIndex, nPos.Map, nPos.X, nPos.Y, True)
            End If
            
            ' Limpiamos la informacion
            Call ClearArenaBattle(Rank, Slot)
        
        End With

        '<EhFooter>
        Exit Sub

RankedTerminate_Err:
        Call LogRanked(Err.Description & " in RankedTerminate at line " & Erl)

        '</EhFooter>
End Sub

Public Sub LogicBattleArena()

    Dim i As Long, J As Long
    
    For i = eRank.e_BRONCE To eRank.e_LAST - 1
    
        With BattleArena(i)

            For J = 1 To .MaxBattleArena(i)

                With .data(J)
                    ' Arena en uso, hago su logica interna.
                    If .Used Then
                        ' Si no empezo el duelo todavia.
                        If Not .Start Then
                    
                            ' Resto de a 1 segundo.
                            .Timing.CountDown = .Timing.CountDown - 1
                        
                            ' Conteo de la ronda hasta empezar.
                            If .Timing.CountDown > 0 Then
                                Call WriteConsoleMsg(.AttackerIndex, "Conteo " & .Timing.CountDown, FontTypeNames.FONTTYPE_FIGHT)
                                Call WriteConsoleMsg(.VictimIndex, "Conteo " & .Timing.CountDown, FontTypeNames.FONTTYPE_FIGHT)
                            Else
                                Call WriteConsoleMsg(.AttackerIndex, "¡¡A luchar!!.", FontTypeNames.FONTTYPE_FIGHT)
                                Call WriteConsoleMsg(.VictimIndex, "¡¡A luchar!!.", FontTypeNames.FONTTYPE_FIGHT)
                            
                                ' Dejo que se puedan mover.
                                Call SendData2(ToIndex, .AttackerIndex, 0, 119)
                                Call SendData2(ToIndex, .VictimIndex, 0, 119)
                            
                                .Start = True
                            
                            End If
                        
                        Else
                            ' Si Vida del duelo(Tiempo de juego total) es igual o mayor a ....
                            If .Timing.LifeBattle >= TIME_LIFE_BATTLE Then
                                Call RankedTerminate(i, J, ByTime:=True)
                            Else
                                .Timing.LifeBattle = .Timing.LifeBattle + 1
                            End If
                    
                        End If
                    End If
                End With
        
            Next J

        End With
    Next i

End Sub
