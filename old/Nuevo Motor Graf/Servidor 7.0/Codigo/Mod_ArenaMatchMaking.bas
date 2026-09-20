Attribute VB_Name = "Mod_ArenaMatchMaking"
Option Explicit

Private QueueRanked(eRank.e_BRONCE To eRank.e_LAST - 1) As New Collection

Public Sub LogicAllQueue()

    Dim I         As Long, J As Long
    Dim DestUser1 As Long
    Dim DestUser2 As Long

    For I = eRank.e_BRONCE To eRank.e_LAST - 1

        With QueueRanked(I)
            If .Count > 1 Then

                For J = 2 To .Count Step 2 ' recorro de 2 en 2
                    ' Slot Primario.
                    ' j - 1
                    
                    ' Slot Secundario.
                    ' j
                    DestUser1 = .Item(J - 1)
                    DestUser2 = .Item(J)
                    
                    If SendToUsersInQueue(I, DestUser1, DestUser2) Then
                        ' Slot Primario.
                        Call RemoveUserQueue(DestUser1)
                    
                        ' Slot Secundario.
                        Call RemoveUserQueue(DestUser2)
                    End If
                Next J

            End If
        End With
    Next I

End Sub

Public Sub AddUserQueue(ByVal UserIndex As Integer)

    With UserList(UserIndex)
    
        If .flags.Muerto = 1 Then
            Call WriteConsoleMsg(UserIndex, "Estas muerto.", FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub
        End If
        
        If Not GetBattleArenaActive() Then
            Call WriteConsoleMsg(UserIndex, "Las Ranked se encuentran desactivadas.", FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub
        End If
        
        If .flags.QueueArena > 0 Then
            Call WriteConsoleMsg(UserIndex, "Ya te encuentras en busqueda de una ranked.", FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub
        End If
        
        If .flags.ArenaBattleSlot > 0 Then
            Call WriteConsoleMsg(UserIndex, "Ya te encuentras en una batalla rankeada.", FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub
        End If
        
        QueueRanked(GetUserRank(UserIndex)).Add UserIndex
        .flags.QueueArena = 1
        Call WriteConsoleMsg(UserIndex, "Colocado en la busqueda de una ranked en " & GetUserRankString(UserIndex) & ".", FontTypeNames.FONTTYPE_FIGHT)
        Exit Sub
            
    End With

End Sub

Public Sub RemoveUserQueue(ByVal UserIndex As Integer)

    Dim I As Long

    With QueueRanked(GetUserRank(UserIndex))

        For I = 1 To .Count
            If .Item(I) = UserIndex Then
                Call .Remove(I)
                Exit For
            End If
        Next I

    End With

End Sub

