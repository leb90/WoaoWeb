Attribute VB_Name = "Mod_ArenaMatchMaking"
Option Explicit

Private QueueRanked(eRank.e_BRONCE To eRank.e_DIAMANTE) As Collection

Public Sub LogicAllQueue()

    Dim i As Long, j As Long

    For i = eRank.e_BRONCE To eRank.e_DIAMANTE

        With QueueRanked(i)

            If .Count > 1 Then
            
                For j = 2 To .Count Step 2
                
                
                Next j
            End If
    
        End With

    Next i

End Sub

Public Sub AddUserQueue(ByVal UserIndex As Integer)

    With UserList(UserIndex)
    
        If .flags.Muerto = 1 Then
            Call WriteConsoleMsg(UserIndex, "Estas muerto.", FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub

        End If
        
        'If .Pos.Map = Ullathorpe.Map Then
        'Call WriteConsoleMsg(UserIndex, "Para mandar ranked tienes que estar en Ullathorpe.", FontTypeNames.FONTTYPE_FIGHT)
        'Exit Sub
        'End If

        If .flags.QueueArena > 0 Then
            Call WriteConsoleMsg(UserIndex, "Ya te encuentras en busqueda de una ranked.", FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub

        End If
        
        QueueRanked(GetUserRank(UserIndex)).Add UserIndex
        Call WriteConsoleMsg(UserIndex, "Colocado en la busqueda de una ranked en " & GetUserRankString(UserIndex) & ".", FontTypeNames.FONTTYPE_FIGHT)
        Exit Sub
            
    End With

End Sub

Public Sub RemoveUserQueue(ByVal UserIndex As Integer)

    Dim i    As Long
    Dim Rank As eRank

    Rank = GetUserRank(UserIndex)

    With QueueRanked(Rank)

        For i = 1 To .Count

            If .Item(i) = UserIndex Then
                .Remove (i)
                Exit For

            End If

        Next i

    End With

End Sub

Public Function GetUserRankString(ByVal UserIndex As Integer) As String
  
    Dim Rank As String

    Select Case UserList(UserIndex).Stats.Elo

        Case 0 To 100
            Rank = "BRONCE"

        Case 101 To 300
            Rank = "PLATA"

        Case 301 To 500
            Rank = "ORO"

        Case 501 To 800
            Rank = "PLATINO"
        
        Case Else
            Rank = "DIAMANTE"
    
    End Select

    GetUserRankString = Rank

End Function

Public Function GetUserRank(ByVal UserIndex As Integer) As eRank
    
    Dim Rank As eRank
    
    Select Case UserList(UserIndex).Stats.Elo

        Case 0 To 100
            Rank = eRank.e_BRONCE

        Case 101 To 300
            Rank = eRank.e_PLATA

        Case 301 To 500
            Rank = eRank.e_ORO

        Case 501 To 800
            Rank = eRank.e_PLATINO
        
        Case Else
            Rank = eRank.e_DIAMANTE

    End Select

    GetUserRank = Rank

End Function

Private Sub WriteConsoleMsg(ByVal UserIndex As Integer, ByVal Msg As String, ByVal Font As FontTypeNames)

    Call SendData(ToIndex, UserIndex, 0, "||" & Msg & "´" & Font)

End Sub

