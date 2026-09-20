Attribute VB_Name = "Premios"
'#######################################################################################################
'#######################################################################################################
'#####################    D E L Z A K  y P L U T O -  S I S T E M A   D E   P R E M I O S    #######################
'######################################  <--(17-8-10)-->  ##############################################
'#######################################################################################################

Sub PremioMataNPC(Logrito As Byte, Userindex As Integer)

    UserList(Userindex).Stats.PremioNPC(Logrito) = UserList(Userindex).Stats.PremioNPC(Logrito) + 1

    Select Case UserList(Userindex).Stats.PremioNPC(Logrito)

    Case 25
        Call SendData(ToIndex, Userindex, 0, "||Logro Conseguido!!" & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "||5% Daño Extra contra " & NOmbrelogro(Logrito) & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)

    Case 100
        Call SendData(ToIndex, Userindex, 0, "||Logro de Bronce Conseguido!!" & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "||10% Defensa Extra contra " & NOmbrelogro(Logrito) & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)

    Case 250
        Call SendData(ToIndex, Userindex, 0, "||Logro de Plata Conseguido!!" & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "||15% Daño Extra contra " & NOmbrelogro(Logrito) & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)

    Case 500
        Call SendData(ToIndex, Userindex, 0, "||Logro de Oro Conseguido!!" & "´" & FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToIndex, Userindex, 0, "||Golpes Críticos contra " & NOmbrelogro(Logrito) & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)

    End Select

End Sub

