Attribute VB_Name = "mod_Quest"
'This program is free software; you can redistribute it and/or modify
'it under the terms of the Affero General Public License;
'either version 1 of the License, or any later version.
'
'This program is distributed in the hope that it will be useful,
'but WITHOUT ANY WARRANTY; without even the implied warranty of
'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
'Affero General Public License for more details.
'
'You should have received a copy of the Affero General Public License
'along with this program; if not, you can find it at [url=http://www.affero.org/oagpl.html]http://www.affero.org/oagpl.html[/url]
'
'Argentum Online is based on Baronsoft's VB6 Online RPG
'You can contact the original creator of ORE at [email=aaron@baronsoft.com]aaron@baronsoft.com[/email]
'for more information about ORE please visit [url=http://www.baronsoft.com/]http://www.baronsoft.com/[/url]
Option Explicit

'Constantes de las quests
Public Const MAXUSERQUESTS As Integer = 15     'Máxima cantidad de quests que puede tener un usuario al mismo tiempo.

Public Function TieneQuest(ByVal Userindex As Integer, _
                           ByVal QuestNumber As Integer) As Byte
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Devuelve el slot de UserQuests en que tiene la quest QuestNumber. En caso contrario devuelve 0.
'Last modified: 27/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Integer

    For i = 1 To MAXUSERQUESTS

        If UserList(Userindex).QuestStats.Quests(i).QuestIndex = QuestNumber Then
            TieneQuest = i
            Exit Function

        End If

    Next i

    TieneQuest = 0

End Function

Public Function FreeQuestSlot(ByVal Userindex As Integer) As Byte
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Devuelve el próximo slot de quest libre.
'Last modified: 27/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Integer

    For i = 1 To MAXUSERQUESTS

        If UserList(Userindex).QuestStats.Quests(i).QuestIndex = 0 Then
            FreeQuestSlot = i
            Exit Function

        End If

    Next i

    FreeQuestSlot = 0

End Function

Public Sub HandleQuestAccept(ByVal Userindex As Integer)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Maneja el evento de aceptar una quest.
'Last modified: 31/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim NpcIndex As Integer
    Dim QuestSlot As Byte

    'Call UserList(Userindex).incomingData.ReadByte

    NpcIndex = UserList(Userindex).flags.TargetNpc

    If NpcIndex = 0 Then
        Call SendData(ToIndex, Userindex, 0, "L4")
        Exit Sub

    End If

    'Está el personaje en la distancia correcta?
    If Distancia(UserList(Userindex).Pos, Npclist(NpcIndex).Pos) > 5 Then
        'Call WriteConsoleMsg(Userindex, "Estás demasiado lejos.", FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "L2")

        Exit Sub

    End If

    QuestSlot = FreeQuestSlot(Userindex)

    'Agregamos la quest.
    With UserList(Userindex).QuestStats.Quests(QuestSlot)
        .QuestIndex = Npclist(NpcIndex).QuestNumber

        If QuestList(.QuestIndex).RequiredNPCs Then ReDim .NPCsKilled(1 To QuestList(.QuestIndex).RequiredNPCs)
        'Call WriteConsoleMsg(Userindex, "Has aceptado la misión " & Chr(34) & QuestList(.QuestIndex).Nombre & Chr(34) _
         & ".", FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "||Has aceptado la misión " & Chr$(34) & QuestList(.QuestIndex).Nombre & _
                                             Chr$(34) & ".´" & FontTypeNames.FONTTYPE_INFO)
   Call SendData(ToIndex, Userindex, 0, "J8")

    End With

End Sub

Public Sub FinishQuest(ByVal Userindex As Integer, _
                       ByVal QuestIndex As Integer, _
                       ByVal QuestSlot As Byte)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Maneja el evento de terminar una quest.
'Last modified: 29/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Integer
    Dim InvSlotsLibres As Byte
    Dim NpcIndex As Integer

    NpcIndex = UserList(Userindex).flags.TargetNpc

    With QuestList(QuestIndex)

        'Comprobamos que tenga los objetos.
        If .RequiredOBJs > 0 Then

            For i = 1 To .RequiredOBJs

                If TieneObjetos(.RequiredOBJ(i).ObjIndex, .RequiredOBJ(i).Amount, Userindex) = False Then

                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, _
                                  "||1°No has conseguido todos los objetos que te he pedido.°" & CStr(Npclist( _
                                                                                                      NpcIndex).Char.CharIndex))

                    'Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||2°" & rdata & "°" & str(ind))
                    Exit Sub

                End If

            Next i

        End If

        'Comprobamos que haya matado todas las criaturas.
        If .RequiredNPCs > 0 Then

            For i = 1 To .RequiredNPCs

                If .RequiredNPC(i).Amount > UserList(Userindex).QuestStats.Quests(QuestSlot).NPCsKilled(i) Then
                    Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, _
                                  "||1°No has matado todas las criaturas que te he pedido.°" & CStr(Npclist( _
                                                                                                    NpcIndex).Char.CharIndex))
                    Exit Sub

                End If

            Next i

        End If

        'Comprobamos que el usuario tenga espacio para recibir los items.
        If .RewardOBJs > 0 Then

            'Buscamos la cantidad de slots de inventario libres.
            For i = 1 To MAX_INVENTORY_SLOTS

                If UserList(Userindex).Invent.Object(i).ObjIndex = 0 Then InvSlotsLibres = InvSlotsLibres + 1
            Next i

            'Nos fijamos si entra
            If InvSlotsLibres < .RewardOBJs Then

                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, _
                              "||2°No tienes suficiente espacio en el inventario para recibir la recompensa. Vuelve cuando hayas hecho más espacio.°" _
                              & CStr(Npclist(NpcIndex).Char.CharIndex))

                Exit Sub

            End If

        End If

        'A esta altura ya cumplió los objetivos, entonces se le entregan las recompensas.
        Call SendData(ToIndex, Userindex, 0, "||¡Has completado la misión " & Chr(34) & QuestList(QuestIndex).Nombre _
                                             & Chr(34) & "!´" & FontTypeNames.FONTTYPE_INFO)

        'Si la quest pedía objetos, se los saca al personaje.
        If .RequiredOBJs Then

            For i = 1 To .RequiredOBJs
                Call QuitarObjetos(.RequiredOBJ(i).ObjIndex, .RequiredOBJ(i).Amount, Userindex)
            Next i

        End If

        'Se entrega la experiencia.
        If .RewardEXP Then
            UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp + .RewardEXP
            Call SendData(ToIndex, Userindex, 0, "||Has ganado " & .RewardEXP & _
                                                 " puntos de experiencia como recompensa.´" & FontTypeNames.FONTTYPE_INFO)

        End If

        'Se entrega el oro.
        If .RewardGLD Then
            UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD + .RewardGLD
            Call SendData(ToIndex, Userindex, 0, "||Has ganado " & .RewardGLD & " monedas de oro como recompensa.´" & _
                                                 FontTypeNames.FONTTYPE_INFO)

        End If

        'Se entrega los puntos.
        If .RewardDragPoints Then
            UserList(Userindex).Stats.Puntos = UserList(Userindex).Stats.Puntos + .RewardDragPoints
            Call SendData(ToIndex, Userindex, 0, "||Has ganado " & .RewardDragPoints & _
                                                 " Puntos de Canje como recompensa.´" & FontTypeNames.FONTTYPE_INFO)
            Dim PuntosC As Integer
            PuntosC = UserList(Userindex).Stats.Puntos
            Call SendData(ToIndex, Userindex, 0, "J5" & PuntosC)

        End If

        'Si hay recompensa de objetos, se entregan.
        If .RewardOBJs > 0 Then

            For i = 1 To .RewardOBJs

                If .RewardOBJ(i).Amount Then
                    Call MeterItemEnInventario(Userindex, .RewardOBJ(i))
                    Call SendData(ToIndex, Userindex, 0, "||Has recibido " & QuestList(QuestIndex).RewardOBJ( _
                                                         i).Amount & " " & ObjData(QuestList(QuestIndex).RewardOBJ(i).ObjIndex).Name & _
                                                         " como recompensa.´" & FontTypeNames.FONTTYPE_INFO)

                End If

            Next i

        End If

        'Actualizamos el personaje
        Call CheckUserLevel(Userindex)
        Call senduserstatsbox(Userindex)
        Call UpdateUserInv(True, Userindex, 0)

        'Limpiamos el slot de quest.
        Call CleanQuestSlot(Userindex, QuestSlot)

        'Ordenamos las quests
        Call ArrangeUserQuests(Userindex)

        'Se agrega que el usuario ya hizo esta quest.
        Call AddDoneQuest(Userindex, QuestIndex)
        Call SendData(ToIndex, Userindex, 0, "J8")

    End With

End Sub

Public Sub AddDoneQuest(ByVal Userindex As Integer, ByVal QuestIndex As Integer)

'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Agrega la quest QuestIndex a la lista de quests hechas.
'Last modified: 28/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    With UserList(Userindex).QuestStats
        .NumQuestsDone = .NumQuestsDone + 1
        ReDim Preserve .QuestsDone(1 To .NumQuestsDone)
        .QuestsDone(.NumQuestsDone) = QuestIndex

    End With

End Sub

Public Function UserDoneQuest(ByVal Userindex As Integer, _
                              ByVal QuestIndex As Integer) As Boolean
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Verifica si el usuario hizo la quest QuestIndex.
'Last modified: 28/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Integer

    With UserList(Userindex).QuestStats

        If .NumQuestsDone Then

            For i = 1 To .NumQuestsDone

                If .QuestsDone(i) = QuestIndex Then
                    UserDoneQuest = True
                    Exit Function

                End If

            Next i

        End If

    End With

    UserDoneQuest = False

End Function

Public Sub CleanQuestSlot(ByVal Userindex As Integer, ByVal QuestSlot As Integer)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Limpia un slot de quest de un usuario.
'Last modified: 28/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Integer

    With UserList(Userindex).QuestStats.Quests(QuestSlot)

        If .QuestIndex Then
            If QuestList(.QuestIndex).RequiredNPCs Then

                For i = 1 To QuestList(.QuestIndex).RequiredNPCs
                    .NPCsKilled(i) = 0
                Next i

            End If

        End If

        .QuestIndex = 0

    End With

End Sub

Public Sub ResetQuestStats(ByVal Userindex As Integer)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Limpia todos los QuestStats de un usuario
'Last modified: 28/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Long

    For i = 1 To MAXUSERQUESTS
        Call CleanQuestSlot(Userindex, i)
    Next i

    With UserList(Userindex).QuestStats
        .NumQuestsDone = 0
        Erase .QuestsDone

    End With

End Sub

Public Sub HandleQuest(ByVal Userindex As Integer)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Maneja el paquete Quest.
'Last modified: 28/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim NpcIndex As Integer
    Dim tmpByte As Byte

    'Leemos el paquete
    'Call UserList(Userindex).incomingData.ReadByte

    NpcIndex = UserList(Userindex).flags.TargetNpc

    If NpcIndex = 0 Then
        Call SendData(ToIndex, Userindex, 0, "L4")
        Exit Sub

    End If

    'Está el personaje en la distancia correcta?
    If Distancia(UserList(Userindex).Pos, Npclist(NpcIndex).Pos) > 5 Then
        'Call WriteConsoleMsg(Userindex, "Estás demasiado lejos.", FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "L2")

        Exit Sub

    End If

    'El NPC hace quests?
    If Npclist(NpcIndex).QuestNumber = 0 Then
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||1°No tengo ninguna misión para ti.°" & _
                                                                        CStr(Npclist(NpcIndex).Char.CharIndex))
        Exit Sub

    End If

    'El personaje ya hizo la quest?
    'If UserDoneQuest(Userindex, Npclist(NpcIndex).QuestNumber) Then
    'Call SendData(ToPCArea, Userindex, PrepareMessageChatOverHead("Ya has hecho una misión para mi.", _
     Npclist(NpcIndex).Char.CharIndex, vbWhite))
    'Exit Sub
    'End If

    'El personaje tiene suficiente nivel?
    If UserList(Userindex).Stats.ELV < QuestList(Npclist(NpcIndex).QuestNumber).RequiredLevel Then
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "||1°Debes ser por lo menos nivel " & _
                                                                        QuestList(Npclist(NpcIndex).QuestNumber).RequiredLevel & " para emprender esta misión.°" & CStr( _
                                                                        Npclist(NpcIndex).Char.CharIndex))
        Exit Sub

    End If

    'A esta altura ya analizo todas las restricciones y esta preparado para el handle propiamente dicho

    tmpByte = TieneQuest(Userindex, Npclist(NpcIndex).QuestNumber)

    If tmpByte Then
        'El usuario está haciendo la quest, entonces va a hablar con el NPC para recibir la recompensa.
        Call FinishQuest(Userindex, Npclist(NpcIndex).QuestNumber, tmpByte)
    Else
        'El usuario no está haciendo la quest, entonces primero recibe un informe con los detalles de la misión.
        tmpByte = FreeQuestSlot(Userindex)

        'El personaje tiene algun slot de quest para la nueva quest?
        If tmpByte = 0 Then
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, _
                          "||1°Estás haciendo demasiadas misiones. Vuelve cuando hayas completado alguna.°" & CStr(Npclist( _
                                                                                                                   NpcIndex).Char.CharIndex))
            Exit Sub

        End If

        'Enviamos los detalles de la quest
        Call WriteQuestDetails(Userindex, Npclist(NpcIndex).QuestNumber)

    End If

End Sub

Public Sub LoadQuests()

'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Carga el archivo QUESTS.DAT en el array QuestList.
'Last modified: 27/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    On Error GoTo ErrorHandler

    Dim Reader As clsIniManager
    Dim NumQuests As Integer
    Dim tmpStr As String
    Dim i As Long
    Dim J As Long

    'Cargamos el clsIniReader en memoria
    Set Reader = New clsIniManager

    If Not FileExist(DatPath & "QUESTS.DAT", vbArchive) Then
        MsgBox "Archivo de QUEST.DAT INNEXISTENTE"

    End If

    'Lo inicializamos para el archivo QUESTS.DAT
    Call Reader.Initialize(DatPath & "QUESTS.DAT")

    'Redimensionamos el array
    NumQuests = Reader.GetValue("INIT", "NumQuests")
    ReDim QuestList(1 To NumQuests)

    'Cargamos los datos
    For i = 1 To NumQuests

        With QuestList(i)
            .Nombre = Reader.GetValue("QUEST" & i, "Nombre")
            .Desc = Reader.GetValue("QUEST" & i, "Desc")
            .RequiredLevel = val(Reader.GetValue("QUEST" & i, "RequiredLevel"))

            'CARGAMOS OBJETOS REQUERIDOS
            .RequiredOBJs = val(Reader.GetValue("QUEST" & i, "RequiredOBJs"))

            If .RequiredOBJs > 0 Then
                ReDim .RequiredOBJ(1 To .RequiredOBJs)

                For J = 1 To .RequiredOBJs
                    tmpStr = Reader.GetValue("QUEST" & i, "RequiredOBJ" & J)

                    .RequiredOBJ(J).ObjIndex = val(ReadField(1, tmpStr, 45))
                    .RequiredOBJ(J).Amount = val(ReadField(2, tmpStr, 45))
                Next J

            End If

            'CARGAMOS NPCS REQUERIDOS
            .RequiredNPCs = val(Reader.GetValue("QUEST" & i, "RequiredNPCs"))

            If .RequiredNPCs > 0 Then
                ReDim .RequiredNPC(1 To .RequiredNPCs)

                For J = 1 To .RequiredNPCs
                    tmpStr = Reader.GetValue("QUEST" & i, "RequiredNPC" & J)

                    .RequiredNPC(J).NpcIndex = val(ReadField(1, tmpStr, 45))
                    .RequiredNPC(J).Amount = val(ReadField(2, tmpStr, 45))
                Next J

            End If

            .RewardGLD = val(Reader.GetValue("QUEST" & i, "RewardGLD")) * 20
            .RewardEXP = val(Reader.GetValue("QUEST" & i, "RewardEXP")) * 80
            .RewardDragPoints = val(Reader.GetValue("QUEST" & i, "RewardDragPoints")) * 20

            'CARGAMOS OBJETOS DE RECOMPENSA
            .RewardOBJs = val(Reader.GetValue("QUEST" & i, "RewardOBJs"))

            If .RewardOBJs > 0 Then
                ReDim .RewardOBJ(1 To .RewardOBJs)

                For J = 1 To .RewardOBJs
                    tmpStr = Reader.GetValue("QUEST" & i, "RewardOBJ" & J)

                    .RewardOBJ(J).ObjIndex = val(ReadField(1, tmpStr, 45))
                    .RewardOBJ(J).Amount = val(ReadField(2, tmpStr, 45))
                Next J

            End If

        End With

    Next i

    'Eliminamos la clase
    Set Reader = Nothing
    Exit Sub

ErrorHandler:
    MsgBox "Error cargando el archivo QUESTS.DAT.", vbOKOnly + vbCritical

End Sub

Public Sub LoadQuestStats(ByVal Userindex As Integer, ByRef UserFile As clsIniManager)

'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Carga las QuestStats del usuario.
'Last modified: 28/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Long
    Dim J As Long
    Dim tmpStr As String
    Dim sep As Integer

    sep = Asc("@")

    For i = 1 To MAXUSERQUESTS

        With UserList(Userindex).QuestStats.Quests(i)
            tmpStr = UserFile.GetValue("QUESTS", "Q" & i)

            .QuestIndex = val(ReadField(1, tmpStr, sep))

            If .QuestIndex Then
                If QuestList(.QuestIndex).RequiredNPCs Then
                    ReDim .NPCsKilled(1 To QuestList(.QuestIndex).RequiredNPCs)

                    For J = 1 To QuestList(.QuestIndex).RequiredNPCs
                        .NPCsKilled(J) = val(ReadField(J + 1, tmpStr, sep))
                    Next J

                End If

            End If

        End With

    Next i

    With UserList(Userindex).QuestStats
        tmpStr = UserFile.GetValue("QUESTS", "QuestsDone")

        .NumQuestsDone = val(ReadField(1, tmpStr, sep))

        If .NumQuestsDone Then
            ReDim .QuestsDone(1 To .NumQuestsDone)

            For i = 1 To .NumQuestsDone
                .QuestsDone(i) = val(ReadField(i + 1, tmpStr, sep))
            Next i

        End If

    End With

End Sub

Public Sub SaveQuestStats(ByVal Userindex As Integer, ByVal UserFile As String)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Guarda las QuestStats del usuario.
'Last modified: 29/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Integer
    Dim J As Integer
    Dim tmpStr As String

    For i = 1 To MAXUSERQUESTS

        With UserList(Userindex).QuestStats.Quests(i)
            tmpStr = .QuestIndex

            If .QuestIndex Then
                If QuestList(.QuestIndex).RequiredNPCs Then

                    For J = 1 To QuestList(.QuestIndex).RequiredNPCs
                        tmpStr = tmpStr & "@" & .NPCsKilled(J)
                    Next J

                End If

            End If

            Call WriteVar(UserFile, "QUESTS", "Q" & i, tmpStr)

        End With

    Next i

    With UserList(Userindex).QuestStats
        tmpStr = .NumQuestsDone

        If .NumQuestsDone Then

            For i = 1 To .NumQuestsDone
                tmpStr = tmpStr & "@" & .QuestsDone(i)
            Next i

        End If

        Call WriteVar(UserFile, "QUESTS", "QuestsDone", tmpStr)

    End With

End Sub

Public Sub HandleQuestListRequest(ByVal Userindex As Integer)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Maneja el paquete QuestListRequest.
'Last modified: 30/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

'Leemos el paquete
'Call UserList(Userindex).incomingData.ReadByte

    Call WriteQuestListSend(Userindex)

End Sub

Public Sub ArrangeUserQuests(ByVal Userindex As Integer)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Ordena las quests del usuario de manera que queden todas al principio del arreglo.
'Last modified: 30/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Integer
    Dim J As Integer

    With UserList(Userindex).QuestStats

        For i = 1 To MAXUSERQUESTS - 1

            If .Quests(i).QuestIndex = 0 Then

                For J = i + 1 To MAXUSERQUESTS

                    If .Quests(J).QuestIndex Then
                        .Quests(i) = .Quests(J)
                        Call CleanQuestSlot(Userindex, J)
                        Exit For

                    End If

                Next J

            End If

        Next i

    End With

End Sub

Public Sub HandleQuestDetailsRequest(ByVal Userindex As Integer, ByVal QuestSlot As Byte)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Maneja el paquete QuestInfoRequest.
'Last modified: 30/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Dim QuestSlot As Byte

'Leemos el paquete
'Call UserList(Userindex).incomingData.ReadByte

'QuestSlot = UserList(Userindex).incomingData.ReadByte

    Call WriteQuestDetails(Userindex, UserList(Userindex).QuestStats.Quests(QuestSlot).QuestIndex, QuestSlot)

End Sub

Public Sub HandleQuestAbandon(ByVal Userindex As Integer, ByVal QuestSlot As Byte)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Maneja el paquete QuestAbandon.
'Last modified: 31/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Leemos el paquete.
'Call UserList(Userindex).incomingData.ReadByte

'Borramos la quest.
    Call CleanQuestSlot(Userindex, QuestSlot)

    'Ordenamos la lista de quests del usuario.
    Call ArrangeUserQuests(Userindex)

    'Enviamos la lista de quests actualizada.
    Call WriteQuestListSend(Userindex)
    Call SendData(ToIndex, Userindex, 0, "J8")

End Sub

Public Sub WriteQuestDetails(ByVal Userindex As Integer, _
                             ByVal QuestIndex As Integer, _
                             Optional QuestSlot As Byte = 0)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Envía el paquete QuestDetails y la información correspondiente.
'Last modified: 30/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Long
    Dim PacketInfo As String
    Dim tmpStr As String

    With UserList(Userindex)

        'ID del paquete
        'Call .WriteByte(ServerPacketID.QuestDetails)
        PacketInfo = "QI"

        'Se usa la variable QuestSlot para saber si enviamos la info de una quest ya empezada o la info de una quest que no se aceptó todavía (1 para el primer caso y 0 para el segundo)
        'Call .WriteByte(IIf(QuestSlot, 1, 0))
        PacketInfo = PacketInfo & "@" & IIf(QuestSlot, 1, 0)

        'Enviamos nombre, descripción y nivel requerido de la quest

        'Call .WriteASCIIString(QuestList(QuestIndex).Nombre)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).Nombre

        'Call .WriteASCIIString(QuestList(QuestIndex).desc)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).Desc

        'Call .WriteByte(QuestList(QuestIndex).RequiredLevel)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).RequiredLevel

        'Enviamos la cantidad de npcs requeridos
        'Call .WriteByte(QuestList(QuestIndex).RequiredNPCs)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).RequiredNPCs

        tmpStr = vbNullString

        If QuestList(QuestIndex).RequiredNPCs Then

            'Si hay npcs entonces enviamos la lista
            For i = 1 To QuestList(QuestIndex).RequiredNPCs

                'Call .WriteInteger(QuestList(QuestIndex).RequiredNPC(i).Amount)
                tmpStr = tmpStr & "@" & QuestList(QuestIndex).RequiredNPC(i).Amount

                'Call .WriteASCIIString(GetVar(DatPath & "NPCs.dat", "NPC" & QuestList(QuestIndex).RequiredNPC(i).NpcIndex, "Name"))
                tmpStr = tmpStr & "@" & GetVar(DatPath & "NPCs-HOSTILES.dat", "NPC" & QuestList( _
                                                                              QuestIndex).RequiredNPC(i).NpcIndex, "Name")

                'Si es una quest ya empezada, entonces mandamos los NPCs que mató.
                If QuestSlot Then
                    ' Call .WriteInteger(UserList(Userindex).QuestStats.Quests(QuestSlot).NPCsKilled(i))
                    tmpStr = tmpStr & "@" & .QuestStats.Quests(QuestSlot).NPCsKilled(i)

                End If

            Next i

        End If

        PacketInfo = PacketInfo & tmpStr

        'Enviamos la cantidad de objs requeridos
        'Call .WriteByte(QuestList(QuestIndex).RequiredOBJs)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).RequiredOBJs

        tmpStr = vbNullString

        If QuestList(QuestIndex).RequiredOBJs Then

            'Si hay objs entonces enviamos la lista
            For i = 1 To QuestList(QuestIndex).RequiredOBJs
                'Call .WriteInteger(QuestList(QuestIndex).RequiredOBJ(i).Amount)
                tmpStr = tmpStr & "@" & QuestList(QuestIndex).RequiredOBJ(i).Amount

                'Call .WriteASCIIString(ObjData(QuestList(QuestIndex).RequiredOBJ(i).ObjIndex).name)
                tmpStr = tmpStr & "@" & ObjData(QuestList(QuestIndex).RequiredOBJ(i).ObjIndex).Name

            Next i

        End If

        PacketInfo = PacketInfo & tmpStr

        'Enviamos la recompensa de oro y experiencia.
        'Call .WriteLong(QuestList(QuestIndex).RewardGLD)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).RewardGLD

        'Call .WriteLong(QuestList(QuestIndex).RewardEXP)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).RewardEXP

        'Call .WriteLong(QuestList(QuestIndex).RewardDragPoints)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).RewardDragPoints

        'Enviamos la cantidad de objs de recompensa
        ' Call .WriteByte(QuestList(QuestIndex).RewardOBJs)
        PacketInfo = PacketInfo & "@" & QuestList(QuestIndex).RewardOBJs
        tmpStr = vbNullString

        If QuestList(QuestIndex).RequiredOBJs Then

            'si hay objs entonces enviamos la lista
            For i = 1 To QuestList(QuestIndex).RewardOBJs
                'Call .WriteInteger(QuestList(QuestIndex).RewardOBJ(i).Amount)
                tmpStr = tmpStr & "@" & QuestList(QuestIndex).RewardOBJ(i).Amount
                'Call .WriteASCIIString(ObjData(QuestList(QuestIndex).RewardOBJ(i).ObjIndex).name)
                tmpStr = tmpStr & "@" & ObjData(QuestList(QuestIndex).RewardOBJ(i).ObjIndex).Name
            Next i

        End If

        PacketInfo = PacketInfo & tmpStr

        Call SendData(ToIndex, Userindex, .Pos.Map, PacketInfo)

    End With

    Exit Sub

End Sub

Public Sub WriteQuestListSend(ByVal Userindex As Integer)
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
'Envía el paquete QuestList y la información correspondiente.
'Last modified: 30/01/2010 by Amraphen
'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    Dim i As Long
    Dim tmpStr As String
    Dim tmpByte As Byte
    Dim PacketInfo As String

    With UserList(Userindex)
        '.outgoingData.WriteByte ServerPacketID.QuestListSend
        PacketInfo = "QL"

        For i = 1 To MAXUSERQUESTS

            If .QuestStats.Quests(i).QuestIndex Then
                tmpByte = tmpByte + 1
                tmpStr = tmpStr & QuestList(.QuestStats.Quests(i).QuestIndex).Nombre & "@"

            End If

        Next i

        'Escribimos la cantidad de quests
        'Call .outgoingData.WriteByte(tmpByte)
        PacketInfo = PacketInfo & "@" & tmpByte

        'Escribimos la lista de quests (sacamos el último caracter)
        If tmpByte Then
            'Call .outgoingData.WriteASCIIString(Left$(tmpStr, Len(tmpStr) - 1))
            PacketInfo = PacketInfo & "@" & Left$(tmpStr, Len(tmpStr) - 1)

        End If

        Call SendData(ToIndex, Userindex, .Pos.Map, PacketInfo)

    End With

    Exit Sub

End Sub
