Attribute VB_Name = "mod_Quest"
Option Explicit

Public Sub HandleQuestDetails(ByVal PackData As String)

    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Recibe y maneja el paquete QuestDetails del servidor.
    'Last modified: 31/01/2010 by Amraphen
    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

    Dim tmpStr        As String
    Dim tmpStr2       As String
    Dim tmpStr3       As String
    Dim tmpByte       As Byte
    Dim QuestEmpezada As Boolean
    Dim i             As Long
    Dim Separador     As Integer
    Dim Count         As Integer
    Separador = Asc("@")

    'Leemos el id del paquete
    'Call .ReadByte
    PackData = Right$(PackData, Len(PackData) - 2)
    Count = Count + 2

    'Nos fijamos si se trata de una quest empezada, para poder leer los NPCs que se han matado.
    'QuestEmpezada = IIf(.ReadByte, True, False)
    tmpByte = Val(ReadField(Count, PackData, Separador))
    QuestEmpezada = IIf(tmpByte, True, False)

    'tmpStr = "Misión: " & .ReadASCIIString & vbCrLf
    Count = Count + 1
    tmpStr = "Misión: " & ReadField(Count, PackData, Separador) & vbCrLf

    'tmpStr = tmpStr & "Detalles: " & .ReadASCIIString & vbCrLf
    Count = Count + 1
    tmpStr = tmpStr & "Detalles: " & ReadField(Count, PackData, Separador) & vbCrLf

    'tmpStr = tmpStr & "Nivel requerido: " & .ReadByte & vbCrLf
    Count = Count + 1
    tmpStr = tmpStr & "Nivel requerido: " & ReadField(Count, PackData, Separador) & vbCrLf

    'tmpStr = tmpStr & vbCrLf & "OBJETIVOS" & vbCrLf
    tmpStr = tmpStr & vbCrLf & "OBJETIVOS" & vbCrLf
    tmpStr3 = tmpStr3 & vbCrLf & "OBJETIVOS" & vbCrLf

    Count = Count + 1
    tmpByte = Val(ReadField(Count, PackData, Separador))

    If tmpByte Then    'Hay NPCs

        For i = 1 To tmpByte

            Count = Count + 1
            tmpStr = tmpStr & "*) Matar " & ReadField(Count, PackData, Separador)
            tmpStr3 = tmpStr3 & "*) Matar " & ReadField(Count, PackData, Separador)

            Count = Count + 1
            tmpStr = tmpStr & " " & ReadField(Count, PackData, Separador) & "."
            tmpStr3 = tmpStr3 & " " & ReadField(Count, PackData, Separador) & "."

            If QuestEmpezada Then
                Count = Count + 1
                tmpStr = tmpStr & " (Has matado " & ReadField(Count, PackData, Separador) & ")" & vbCrLf
                tmpStr3 = tmpStr3 & " (Has matado " & ReadField(Count, PackData, Separador) & ")" & vbCrLf
            Else
                tmpStr = tmpStr & vbCrLf
                tmpStr3 = tmpStr3 & vbCrLf

            End If

        Next i

    End If

    Count = Count + 1
    tmpByte = Val(ReadField(Count, PackData, Separador))

    If tmpByte Then    'Hay OBJs

        For i = 1 To tmpByte
            Count = Count + 1
            tmpStr = tmpStr & "*) Conseguir " & ReadField(Count, PackData, Separador)
            Count = Count + 1
            tmpStr = tmpStr & " " & ReadField(Count, PackData, Separador)

        Next i

    End If

    tmpStr = tmpStr & vbCrLf & "RECOMPENSAS" & vbCrLf
    Count = Count + 1
    tmpStr = tmpStr & "*) Oro: " & ReadField(Count, PackData, Separador) & " monedas de oro." & vbCrLf
    Count = Count + 1
    tmpStr = tmpStr & "*) Experiencia: " & ReadField(Count, PackData, Separador) & " puntos de experiencia." & vbCrLf
    Count = Count + 1
    tmpStr = tmpStr & "*) Puntos de Canje: " & ReadField(Count, PackData, Separador) & " Puntos de Canje." & vbCrLf

    Count = Count + 1
    tmpByte = Val(ReadField(Count, PackData, Separador))

    If tmpByte Then

        For i = 1 To tmpByte
            Count = Count + 1
            tmpStr = tmpStr & "*) " & ReadField(Count, PackData, Separador)
            Count = Count + 1
            tmpStr = tmpStr & " " & ReadField(Count, PackData, Separador) & vbCrLf
        Next i

    End If

    'Determinamos que formulario se muestra, según si recibimos la información y la quest está empezada o no.
    If QuestEmpezada Then
        frmQuests.txtInfo.Text = tmpStr
        frmMain.TxtQuest.Text = tmpStr3
    Else
        frmQuestInfo.txtInfo.Text = tmpStr
        frmQuestInfo.Show vbModeless, frmMain

    End If

End Sub

Public Sub HandleQuestListSend(ByVal PackData As String)

    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Recibe y maneja el paquete QuestListSend del servidor.
    'Last modified: 31/01/2010 by Amraphen
    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

    Dim i         As Long
    Dim tmpByte   As Byte
    Dim tmpStr    As String
    Dim Separador As Integer
    Dim Count     As Integer
    Separador = Asc("@")

    'Leemos el id del paquete
    'Call Buffer.ReadByte
    PackData = Right$(PackData, Len(PackData) - 2)

    'Leemos la cantidad de quests que tiene el usuario
    'tmpByte = Buffer.ReadByte
    Count = Count + 2
    tmpByte = Val(ReadField(Count, PackData, Separador))

    'Limpiamos el ListBox y el TextBox del formulario
    frmQuests.lstQuests.Clear
    frmMain.ListadoQuest.Clear
    frmQuests.txtInfo.Text = vbNullString
    frmMain.TxtQuest.Text = vbNullString

    'Si el usuario tiene quests entonces hacemos el handle
    If tmpByte Then

        'Leemos el string
        'tmpStr = Buffer.ReadASCIIString
        'Agregamos los items
        For i = 1 To tmpByte
            Count = Count + 1
            frmQuests.lstQuests.AddItem ReadField(Count, PackData, Separador)
            frmMain.ListadoQuest.AddItem ReadField(Count, PackData, Separador)
        Next i

    End If

    'Mostramos el formulario
    'frmQuests.Show vbModeless, frmMain

    'Pedimos la información de la primer quest (si la hay)
    If tmpByte Then Call WriteQuestDetailsRequest(1)

End Sub

Public Sub WriteQuest()

    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Escribe el paquete Quest al servidor.
    'Last modified: 31/01/2010 by Amraphen
    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Call outgoingData.WriteByte(ClientPacketID.Quest)
    Call SendData("QQ")

End Sub

Public Sub WriteQuestDetailsRequest(ByVal QuestSlot As Byte)

    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Escribe el paquete QuestDetailsRequest al servidor.
    'Last modified: 31/01/2010 by Amraphen
    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Call outgoingData.WriteByte(ClientPacketID.QuestDetailsRequest)

    Call SendData("QD" & QuestSlot)

End Sub

Public Sub WriteQuestAbandon(ByVal QuestSlot As Byte)

    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Escribe el paquete QuestAbandon al servidor.
    'Last modified: 31/01/2010 by Amraphen
    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Escribe el ID del paquete.
    'Call outgoingData.WriteByte(ClientPacketID.QuestAbandon)

    'Escribe el Slot de Quest.
    Call SendData("QA" & QuestSlot)

End Sub

Public Sub WriteQuestAccept()

    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Escribe el paquete QuestAccept al servidor.
    'Last modified: 31/01/2010 by Amraphen
    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Call outgoingData.WriteByte(ClientPacketID.QuestAccept)
    Call SendData("QW")

End Sub

Public Sub WriteQuestListRequest()

    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Escribe el paquete QuestListRequest al servidor.
    'Last modified: 31/01/2010 by Amraphen
    '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    'Call outgoingData.WriteByte(ClientPacketID.QuestListRequest)
    Call SendData("QR")

End Sub

