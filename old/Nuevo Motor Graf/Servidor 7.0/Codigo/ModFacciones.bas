Attribute VB_Name = "ModFacciones"
Option Explicit

Public ArmaduraImperial1 As Integer    'Primer jerarquia
Public ArmaduraImperial2 As Integer    'Segunda jerarquía
Public ArmaduraImperial3 As Integer    'Enanos
Public TunicaMagoImperial As Integer    'Magos
Public TunicaMagoImperialEnanos As Integer    'Magos

Public ArmaduraCaos1 As Integer
Public TunicaMagoCaos As Integer
Public TunicaMagoCaosEnanos As Integer
Public ArmaduraCaos2 As Integer
Public ArmaduraCaos3 As Integer

Public ArmaduraLegion1 As Integer
Public TunicaMagoLegion As Integer
Public TunicaMagoLegionEnanos As Integer
Public ArmaduraLegion2 As Integer
Public ArmaduraLegion3 As Integer

Public Const ExpAlUnirse = 100000
Public Const ExpX100 = 100000

Public Sub EnlistarArmadaRealN(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).Faccion.ArmadaReal = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||6°Ya perteneces a la Alianza!!! Ve a combatir Hordas!!!°" _
                                             & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

   ' If UserList(Userindex).Faccion.ArmadaReal = 2 Then
       ' Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya perteneces a las tropas de la Legión !!! Ve a combatir criminales!!!°" & str(Npclist(UserList( _
                                                                                                                   Userindex).flags.TargetNpc).Char.CharIndex))
      '  Exit Sub

   ' End If

    'If UserList(Userindex).Faccion.RecibioExpInicialReal = 2 Then
     '   Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya has pertenecido a las tropas de la Legión, no puedes entrar a la Armada. !!!°" & str(Npclist( _
                                                                                                                   UserList(Userindex).flags.TargetNpc).Char.CharIndex))
      '  Exit Sub

    'End If

    If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||6°Maldito insolente!!! vete de aqui seguidor de la Horda!!!°" & _
                                             str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If
    
        If UserList(Userindex).Faccion.RecibioExpInicialReal > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||6°No queremos antiguos miembros de la Alianza en nuestras filas.°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'pluto:hoy
    If UserList(Userindex).Faccion.RecibioExpInicialCaos > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||6°No queremos antiguos miembros de la Horda en nuestras filas.°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

   ' If Criminal(Userindex) Then
       ' Call SendData(ToIndex, Userindex, 0, "||6ºNo se permiten criminales en el ejercito imperial!!!" & "°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

   ' End If

   ' If UserList(Userindex).Faccion.CriminalesMatados < 10 Then
     '   Call SendData(ToIndex, Userindex, 0, _
                      "||6°Para unirte a nuestras fuerzas debes matar al menos 10 criminales, solo has matado " & UserList( _
                      Userindex).Faccion.CriminalesMatados & "°" & str(Npclist(UserList( _
                                                                               Userindex).flags.TargetNpc).Char.CharIndex))
      '  Exit Sub

   ' End If

    'If UserList(Userindex).Stats.ELV < 30 Then
       ' Call SendData(ToIndex, Userindex, 0, "||6°Para unirte a nuestras fuerzas debes ser al menos de nivel 30!!!°" _
                                             & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

    'End If

   ' If UserList(Userindex).Faccion.CiudadanosMatados > 5 Then
       ' Call SendData(ToIndex, Userindex, 0, _
                      "||6°Has asesinado más de 5 ciudadanos, no aceptamos asesinos en las tropas reales!°" & str(Npclist( _
                                                                                                                  UserList(Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

   ' End If

    UserList(Userindex).Faccion.ArmadaReal = 1
    'pluto:2.4.7.
    'UserList(Userindex).Faccion.RecompensasReal = (UserList(Userindex).Faccion.CriminalesMatados \ 60) + (UserList(Userindex).Faccion.CiudadanosMatados \ 60)
    UserList(Userindex).Faccion.RecompensasReal = 0

    Call SendData(ToIndex, Userindex, 0, _
                  "||Bienvenido a la alianza!!! Cuando mates 10 Hordas, dirigete a Banderbill por tu recompensa, buena suerte soldado!" & "´" & FontTypeNames.FONTTYPE_INFO)
                  

   ' If UserList(Userindex).Faccion.RecibioArmaduraReal = 0 Then
      '  Dim MiObj As obj
      '  MiObj.Amount = 1

      '  If UCase$(UserList(Userindex).clase) = "MAGO" Or UCase$(UserList(Userindex).clase) = "DRUIDA" Then
      '      If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
       '        UserList(Userindex).raza) = "GOBLIN" Then
        '        MiObj.ObjIndex = TunicaMagoImperialEnanos
         '   Else
          '      MiObj.ObjIndex = TunicaMagoImperial

           '     If UCase$(UserList(Userindex).Genero) = "MUJER" Then MiObj.ObjIndex = 516

            'End If

       ' ElseIf UCase$(UserList(Userindex).clase) = "GUERRERO" Or UCase$(UserList(Userindex).clase) = "PALADIN" Then

         '   If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
               UserList(Userindex).raza) = "GOBLIN" Then
            '    MiObj.ObjIndex = ArmaduraImperial3
          '  Else
           '     MiObj.ObjIndex = ArmaduraImperial1

            'End If

       ' Else

         '   If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
         '      UserList(Userindex).raza) = "GOBLIN" Then
          '      MiObj.ObjIndex = 522
         '  Else
           '     MiObj.ObjIndex = ArmaduraImperial2

            '    If UCase$(UserList(Userindex).Genero) = "MUJER" Then MiObj.ObjIndex = 719

           ' End If

       ' End If

       ' If Not MeterItemEnInventario(Userindex, MiObj) Then
        '    Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

       ' End If

       ' UserList(Userindex).Faccion.RecibioArmaduraReal = 1

   ' End If

   ' If UserList(Userindex).Faccion.RecibioExpInicialReal = 0 Then
     '   Call AddtoVar(UserList(Userindex).Stats.exp, ExpAlUnirse, MAXEXP)
     '   Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpAlUnirse & " puntos de experiencia." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
      '  UserList(Userindex).Faccion.RecibioExpInicialReal = 1
      '  Call CheckUserLevel(Userindex)
        'pluto:2.17
     '   UserList(Userindex).Stats.SkillPts = UserList(Userindex).Stats.SkillPts + 50
     '   Call SendData(ToIndex, Userindex, 0, "||Has ganado 50 SkillPoints." & "´" & FontTypeNames.FONTTYPE_INFO)
        '--------------

    'End If

    Call LogEjercitoReal(UserList(Userindex).Name)
    Exit Sub
fallo:
    Call LogError("enlistararmadareal " & Err.number & " D: " & Err.Description)

End Sub

Public Sub EnlistarArmadaReal(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).Faccion.ArmadaReal = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||6°Ya perteneces a la Alianza!!! Ve a combatir Hordas!!!°" _
                                             & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'If UserList(Userindex).Faccion.ArmadaReal = 2 Then
        'Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya perteneces a las tropas de la Legión !!! Ve a combatir criminales!!!°" & str(Npclist(UserList( _
                                                                                                                   Userindex).flags.TargetNpc).Char.CharIndex))
        'Exit Sub

   ' End If

    'If UserList(Userindex).Faccion.RecibioExpInicialReal = 2 Then
        'Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya has pertenecido a las tropas de la Legión, no puedes entrar a la Armada. !!!°" & str(Npclist( _
                                                                                                                   UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        'Exit Sub

   ' End If
   
       If UserList(Userindex).Faccion.RecibioExpInicialReal > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||6°No queremos antiguos miembros de la Alianza en nuestras filas.°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'pluto:hoy
    If UserList(Userindex).Faccion.RecibioExpInicialCaos > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||6°No queremos antiguos miembros de la Horda en nuestras filas.°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||6°Maldito insolente!!! vete de aqui seguidor de la Horda!!!°" & _
                                             str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'If Criminal(Userindex) Then
       ' Call SendData(ToIndex, Userindex, 0, "||6ºNo se permiten criminales en el ejercito imperial!!!" & "°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

   ' End If

   ' If UserList(Userindex).Faccion.CriminalesMatados < 10 Then
      '  Call SendData(ToIndex, Userindex, 0, _
                      "||6°Para unirte a nuestras fuerzas debes matar al menos 10 criminales, solo has matado " & UserList( _
                      Userindex).Faccion.CriminalesMatados & "°" & str(Npclist(UserList( _
                                                                               Userindex).flags.TargetNpc).Char.CharIndex))
      '  Exit Sub

  '  End If

   ' If UserList(Userindex).Stats.ELV < 30 Then
    '    Call SendData(ToIndex, Userindex, 0, "||6°Para unirte a nuestras fuerzas debes ser al menos de nivel 30!!!°" _
                                             & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
     '   Exit Sub

   ' End If

   ' If UserList(Userindex).Faccion.CiudadanosMatados > 5 Then
       ' Call SendData(ToIndex, Userindex, 0, _
                      "||6°Has asesinado más de 5 ciudadanos, no aceptamos asesinos en las tropas reales!°" & str(Npclist( _
                                                                                                                  UserList(Userindex).flags.TargetNpc).Char.CharIndex))
      '  Exit Sub

   ' End If

    UserList(Userindex).Faccion.ArmadaReal = 1
    'pluto:2.4.7.
    'UserList(userindex).Faccion.RecompensasReal = UserList(userindex).Faccion.CriminalesMatados \ 100
    'UserList(Userindex).Faccion.RecompensasReal = 1

    Call SendData(ToIndex, Userindex, 0, _
                  "||6°Bienvenido a la alianza!!! Cuando mates 10 Hordas, dirigete a Banderbill por tu recompensa, buena suerte soldado!°" _
                  & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

    'If UserList(Userindex).Faccion.RecibioArmaduraReal = 0 Then
       ' Dim MiObj As obj
     '   MiObj.Amount = 1

      '  If UCase$(UserList(Userindex).clase) = "MAGO" Or UCase$(UserList(Userindex).clase) = "DRUIDA" Then
       '     If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
        '       UserList(Userindex).raza) = "GOBLIN" Then
         '       MiObj.ObjIndex = TunicaMagoImperialEnanos
          '  Else
           '     MiObj.ObjIndex = TunicaMagoImperial

            '    If UCase$(UserList(Userindex).Genero) = "MUJER" Then MiObj.ObjIndex = 516

            'End If

        'ElseIf UCase$(UserList(Userindex).clase) = "GUERRERO" Or UCase$(UserList(Userindex).clase) = "PALADIN" Then

      '      If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
       '        UserList(Userindex).raza) = "GOBLIN" Then
        '        MiObj.ObjIndex = ArmaduraImperial3
         '   Else
          '      MiObj.ObjIndex = ArmaduraImperial1

           ' End If

       ' Else
'
 '           If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
  '             UserList(Userindex).raza) = "GOBLIN" Then
   '             MiObj.ObjIndex = 522
    '        Else
     '           MiObj.ObjIndex = ArmaduraImperial2

      '          If UCase$(UserList(Userindex).Genero) = "MUJER" Then MiObj.ObjIndex = 719

       '     End If

        'End If

    '    If Not MeterItemEnInventario(Userindex, MiObj) Then
     '       Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

      '  End If

       ' UserList(Userindex).Faccion.RecibioArmaduraReal = 1

    'End If

  '  If UserList(Userindex).Faccion.RecibioExpInicialReal = 0 Then
   '     Call AddtoVar(UserList(Userindex).Stats.exp, ExpAlUnirse, MAXEXP)
    '    Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpAlUnirse & " puntos de experiencia." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
     '   UserList(Userindex).Faccion.RecibioExpInicialReal = 1
      '  Call CheckUserLevel(Userindex)
       ' 'pluto:2.17
        'UserList(Userindex).Stats.SkillPts = UserList(Userindex).Stats.SkillPts + 50
        'Call SendData(ToIndex, Userindex, 0, "||Has ganado 50 SkillPoints." & "´" & FontTypeNames.FONTTYPE_INFO)
        '--------------

   ' End If

    Call LogEjercitoReal(UserList(Userindex).Name)
    Exit Sub
fallo:
    Call LogError("enlistararmadareal " & Err.number & " D: " & Err.Description)

End Sub

Public Sub Enlistarlegion(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).Faccion.ArmadaReal = 2 Then
        'Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya perteneces al gremio de Mercenarios" & str(Npclist(UserList( _
                      Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'If UserList(Userindex).Faccion.ArmadaReal = 1 Then
       ' Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya perteneces a las tropas de la Armada Real!!! No puedes pertenecer a la Legión.°" & str( _
                      Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

    'End If

   ' If UserList(Userindex).Faccion.RecibioExpInicialReal = 1 Then
        'Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya has pertenecido a las tropas de la Armada Real!!! No puedes pertenecer a la Legión.°" & str( _
                      Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        'Exit Sub

   ' End If

    'If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
     '   Call SendData(ToIndex, Userindex, 0, "||6°Maldito insolente!!! vete de aqui seguidor de las sombras!!!°" & _
                                             str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
      '  Exit Sub

   ' End If

   ' If Criminal(Userindex) Then
    '    Call SendData(ToIndex, Userindex, 0, "||6°No se permiten criminales en la Legión.!!!°" & str(Npclist(UserList( _
                                                                                                             Userindex).flags.TargetNpc).Char.CharIndex))
     '   Exit Sub

   ' End If

  '  If UserList(Userindex).Stats.ELV < 30 Then
     '   Call SendData(ToIndex, Userindex, 0, "||6°Para unirte a nuestras fuerzas debes ser al menos de nivel 30!!!°" _
                                             & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
     '   Exit Sub

   ' End If

   ' If UserList(Userindex).Faccion.CiudadanosMatados > 5 Then
     '   Call SendData(ToIndex, Userindex, 0, _
                      "||6°Has asesinado más de 5 inocentes, no aceptamos asesinos en las tropas de la Legión!°" & str( _
                      Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
      '  Exit Sub

   ' End If

    UserList(Userindex).Faccion.ArmadaReal = 2
    'pluto:2.4.7
    'UserList(userindex).Faccion.RecompensasReal = (UserList(userindex).Stats.ELV - 28) \ 2
    UserList(Userindex).Faccion.RecompensasReal = 0

    
    Call SendData(ToIndex, Userindex, 0, _
                  "||Bienvenido a al Ejercito Neutral!!!. Somos un Gremio de Mercenarios, solo nos interesa matar a cambio de algo!" & "´" & FontTypeNames.FONTTYPE_INFO)

    'pluto:2.3
    'If UserList(Userindex).Faccion.RecibioArmaduraLegion = 0 Then
      '  Dim MiObj As obj
      '  MiObj.Amount = 1

       ' If UCase$(UserList(Userindex).clase) = "MAGO" Or UCase$(UserList(Userindex).clase) = "DRUIDA" Then
         '   If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
          '     UserList(Userindex).raza) = "GOBLIN" Then
           '     MiObj.ObjIndex = TunicaMagoLegionEnanos
           ' Else
           '     MiObj.ObjIndex = TunicaMagoLegion

            'End If

     '   ElseIf UCase$(UserList(Userindex).clase) = "GUERRERO" Or UCase$(UserList(Userindex).clase) = "PALADIN" Then

         '   If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
         '      UserList(Userindex).raza) = "GOBLIN" Then
         '       MiObj.ObjIndex = ArmaduraLegion3
         '   Else
         '       MiObj.ObjIndex = ArmaduraLegion1

         '   End If

      '  Else

         '   If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
          '     UserList(Userindex).raza) = "GOBLIN" Then
           '     MiObj.ObjIndex = ArmaduraLegion3
           ' Else
            '    MiObj.ObjIndex = ArmaduraLegion2

            'End If

        'End If

      '  If Not MeterItemEnInventario(Userindex, MiObj) Then
     '       Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

    '    End If

    '    UserList(Userindex).Faccion.RecibioArmaduraLegion = 1

  '  End If

  '  If UserList(Userindex).Faccion.RecibioExpInicialReal = 0 Then
   '     Call AddtoVar(UserList(Userindex).Stats.exp, ExpAlUnirse, MAXEXP)
   '     Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpAlUnirse & " puntos de experiencia." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
   '     UserList(Userindex).Faccion.RecibioExpInicialReal = 2
   '     Call CheckUserLevel(Userindex)

 '   End If

    Call LogEjercitoReal(UserList(Userindex).Name)
    Exit Sub
fallo:
    Call LogError("enlistarlegion " & Err.number & " D: " & Err.Description)

End Sub

Public Sub RecompensaArmadaReal(ByVal Userindex As Integer)

    On Error GoTo fallo
    
    If UserList(Userindex).Faccion.CriminalesMatados < 10 Then
        Call SendData(ToIndex, Userindex, 0, _
                      "||6°Debes asesinar al menos 10 integrantes de la Horda para recibir tu primera recompensa!°" & str( _
                      Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If
    
    
    If UserList(Userindex).Faccion.RecompensasReal = 0 Then
    
    UserList(Userindex).Faccion.RecompensasReal = 1

    Call SendData(ToIndex, Userindex, 0, _
                  "||6°Felicidades, aqui tienes tu armadura. Por cada 30 de criminales que acabes te dare un recompensa, buena suerte soldado!°" _
                  & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

    If UserList(Userindex).Faccion.RecibioArmaduraReal = 0 Then
        Dim MiObj As obj
        MiObj.Amount = 1

        If UCase$(UserList(Userindex).clase) = "MAGO" Or UCase$(UserList(Userindex).clase) = "DRUIDA" Then
            If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
               UserList(Userindex).raza) = "GOBLIN" Then
                MiObj.ObjIndex = TunicaMagoImperialEnanos
            Else
                MiObj.ObjIndex = TunicaMagoImperial

                If UCase$(UserList(Userindex).Genero) = "MUJER" Then MiObj.ObjIndex = 516

            End If

        ElseIf UCase$(UserList(Userindex).clase) = "GUERRERO" Or UCase$(UserList(Userindex).clase) = "PALADIN" Then

            If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
               UserList(Userindex).raza) = "GOBLIN" Then
                MiObj.ObjIndex = ArmaduraImperial3
            Else
                MiObj.ObjIndex = ArmaduraImperial1

            End If

        Else

            If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
               UserList(Userindex).raza) = "GOBLIN" Then
                MiObj.ObjIndex = 522
            Else
                MiObj.ObjIndex = ArmaduraImperial2

                If UCase$(UserList(Userindex).Genero) = "MUJER" Then MiObj.ObjIndex = 719

            End If

        End If

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        End If

        UserList(Userindex).Faccion.RecibioArmaduraReal = 1

    End If

    If UserList(Userindex).Faccion.RecibioExpInicialReal = 0 Then
        Call AddtoVar(UserList(Userindex).Stats.exp, ExpAlUnirse, MAXEXP)
        Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpAlUnirse & " puntos de experiencia." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
        UserList(Userindex).Faccion.RecibioExpInicialReal = 1
        Call CheckUserLevel(Userindex)
        Call senduserstatsbox(Userindex)
        'pluto:2.17
        'UserList(Userindex).Stats.SkillPts = UserList(Userindex).Stats.SkillPts + 50
        'Call SendData(ToIndex, Userindex, 0, "||Has ganado 50 SkillPoints." & "´" & FontTypeNames.FONTTYPE_INFO)
        '--------------

    End If
    
    Exit Sub
    
    End If
    
    
    ''' fin

    If UserList(Userindex).Faccion.CriminalesMatados \ 30 <= UserList(Userindex).Faccion.RecompensasReal Then
        Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya has recibido tu recompensa, mata 30 Hordas mas para recibir la proxima!!!°" & str(Npclist( _
                                                                                                                    UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'pluto:2.3
    Dim dar As Integer
    Dim Qui As Integer
    Dim recibida As Byte
    Dim clase As String
    Dim raza As String
    Dim Genero As String
    Dim recompensa As Byte
    'Dim alli As Byte
    recibida = UserList(Userindex).Faccion.RecibioArmaduraReal
    recompensa = UserList(Userindex).Faccion.RecompensasReal
    clase = UCase$(UserList(Userindex).clase)
    raza = UCase$(UserList(Userindex).raza)
    Genero = UCase$(UserList(Userindex).Genero)

    'pluto:2.17
    If recompensa > 9 Then Exit Sub

    If recompensa <> 4 And recompensa <> 7 Then GoTo alli

    Select Case recompensa

    Case 4

        If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

            If clase = "MAGO" Or clase = "DRUIDA" Then
                dar = 743
                Qui = 549
            ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then
                dar = 616
                Qui = 492
            Else
                dar = 955
                Qui = 522

            End If

        Else    'raza

            If clase = "MAGO" Or clase = "DRUIDA" Then

                Select Case Genero

                Case "HOMBRE"
                    dar = 618
                    Qui = 517

                Case "MUJER"
                    'pluto:7.0
                    dar = 701
                    Qui = 516
                End Select    'GENERO

            ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then

                Select Case Genero

                Case "HOMBRE"
                    dar = 620
                    Qui = 370

                Case "MUJER"
                    dar = 620
                    Qui = 370

                End Select    'GENERO

            Else

                Select Case Genero

                Case "HOMBRE"
                    dar = 715
                    Qui = 372

                Case "MUJER"
                    dar = 520
                    Qui = 719
                End Select    'GENERO

            End If    'CLASE

        End If    'RAZA

    Case 7

        If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

            If clase = "MAGO" Or clase = "DRUIDA" Then
                dar = 742
                Qui = 743
            ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then
                dar = 740
                Qui = 616
            Else
                dar = 956
                Qui = 955
            End If    'CLASE

        Else    'RAZA no enana

            If clase = "MAGO" Or clase = "DRUIDA" Then

                Select Case Genero

                Case "HOMBRE"
                    dar = 369
                    Qui = 618

                Case "MUJER"
                    dar = 369
                    Qui = 618
                End Select    'GENERO

            ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then

                Select Case Genero

                Case "HOMBRE"
                    dar = 704
                    Qui = 620

                Case "MUJER"
                    dar = 704
                    Qui = 620

                End Select    'GENERO

            Else

                Select Case Genero

                Case "HOMBRE"
                    dar = 621
                    Qui = 715

                Case "MUJER"
                    dar = 521
                    Qui = 520
                End Select    'GENERO

            End If    'CLASE

        End If    'RAZA

    End Select    'recompensa

    'comprueba objeto y lo cambia
    If dar = 0 Or Qui = 0 Then
        Call SendData(ToIndex, Userindex, 0, "|| No existe la ropa que te corresponde." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    Dim Slot As Integer

    If UserList(Userindex).Invent.ArmourEqpObjIndex = Qui Then
        Slot = UserList(Userindex).Invent.ArmourEqpSlot
        Call QuitarUserInvItem(Userindex, Slot, 1)
        Call UpdateUserInv(False, Userindex, Slot)

        Call DarCuerpoDesnudo(Userindex)
        Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Char.Body, UserList( _
                                                                                                             Userindex).OrigChar.Head, UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, _
                            UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList( _
                                                                                                     Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
        
        MiObj.Amount = 1
        MiObj.ObjIndex = dar

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        End If

    Else
        Call SendData(ToIndex, Userindex, 0, _
                      "|| No tienes la ropa del rango anterior equipada, vuelve cuando la tengas." & "´" & _
                      FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

alli:
    Call SendData(ToIndex, Userindex, 0, "||6°Aqui tienes tu recompensa noble guerrero!!!°" & str(Npclist(UserList( _
                                                                                                          Userindex).flags.TargetNpc).Char.CharIndex))
    Call AddtoVar(UserList(Userindex).Stats.exp, ExpX100, MAXEXP)
    Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpX100 & " puntos de experiencia." & "´" & _
                                         FontTypeNames.FONTTYPE_FIGHT)
    UserList(Userindex).Faccion.RecompensasReal = UserList(Userindex).Faccion.RecompensasReal + 1
    'pluto:2.17
    'UserList(Userindex).Stats.SkillPts = UserList(Userindex).Stats.SkillPts + 10
    'Call SendData(ToIndex, Userindex, 0, "||Has ganado 10 SkillPoints." & "´" & FontTypeNames.FONTTYPE_INFO)
    '--------------

    Call CheckUserLevel(Userindex)
    Call senduserstatsbox(Userindex)

    Exit Sub
fallo:
    Call LogError("recompensa armada real " & Err.number & " D: " & Err.Description)

End Sub

Public Sub Recompensalegion(ByVal Userindex As Integer)

    On Error GoTo fallo

    'If (UserList(Userindex).Stats.ELV - 28) \ 2 = UserList(Userindex).Faccion.RecompensasReal Then
       ' Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya has recibido tu recompensa,sube más nivel para subir de rango.!!!°" & str(Npclist(UserList( _
                                                                                                                Userindex).flags.TargetNpc).Char.CharIndex))
        'pluto:2.4.7 --> faltaba un exit sub
       ' Exit Sub

   ' End If

    'pluto:2.3
   ' Dim dar As Integer
    'Dim Qui As Integer
  '  Dim recibida As Byte
   ' Dim clase As String
  '  Dim raza As String
  '  Dim Genero As String
  '  Dim recompensa As Byte
    'Dim alli As Byte
  '  recibida = UserList(Userindex).Faccion.RecibioArmaduraLegion
   ' recompensa = UserList(Userindex).Faccion.RecompensasReal
  '  clase = UCase$(UserList(Userindex).clase)
   ' raza = UCase$(UserList(Userindex).raza)
   ' Genero = UCase$(UserList(Userindex).Genero)

    'pluto:2.4.7 -->arreglado fallo legion
   ' If recompensa <> 2 And recompensa <> 5 Then GoTo alli

   ' Select Case recompensa

    'Case 2

       ' If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

          '  If clase = "MAGO" Or clase = "DRUIDA" Then
           '     dar = 885
            '    Qui = 810
            'ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then
             '   dar = 869
              '  Qui = 809
            'Else
             '   dar = 869
              '  Qui = 809

         '   End If

       ' Else    'raza

          '  If clase = "MAGO" Or clase = "DRUIDA" Then

           '     Select Case Genero

            '    Case "HOMBRE"
 '                   dar = 706
'                    Qui = 707

  '              Case "MUJER"
   '                 dar = 706
    '                Qui = 707
     '           End Select    'GENERO

      '      ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then

       '         Select Case Genero

        '        Case "HOMBRE"
         '           dar = 702
          '          Qui = 701

           '     Case "MUJER"
             '       dar = 702
            '        Qui = 701
              '  End Select    'GENERO

        '    Else

         '       Select Case Genero

          '      Case "HOMBRE"
           '         dar = 702
            '        Qui = 701

             '   Case "MUJER"
              '      dar = 702
               '     Qui = 701
                'End Select    'GENERO

          '  End If    'CLASE

       ' End If    'RAZA

  '  Case 5

     '   If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

      '      If clase = "MAGO" Or clase = "DRUIDA" Then
       '         dar = 886
        '        Qui = 885
         '   ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then
          '      dar = 870
           '     Qui = 869
            'Else
               ' dar = 870
     '           Qui = 869
      '      End If    'CLASE

       ' Else    'RAZA no enana

        '    If clase = "MAGO" Or clase = "DRUIDA" Then

         '       Select Case Genero

          '      Case "HOMBRE"
           '         dar = 708
            '        Qui = 706

             '   Case "MUJER"
              '      dar = 708
               '     Qui = 706
                'End Select    'GENERO

        '    ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then

   '             Select Case Genero

    '            Case "HOMBRE"
     '               dar = 703
      '              Qui = 702

       '         Case "MUJER"
        '            dar = 703
         '           Qui = 702
          '      End Select    'GENERO

           ' Else

            '    Select Case Genero

             '   Case "HOMBRE"
               '     dar = 703
              '      Qui = 702

                'Case "MUJER"
                 '   dar = 703
                  '  Qui = 702
            '    End Select    'GENERO

          '  End If    'CLASE

       ' End If    'RAZA

   ' End Select    'recompensa

    'comprueba objeto y lo cambia
  '  If dar = 0 Or Qui = 0 Then
   '     Call SendData(ToIndex, Userindex, 0, "|| No existe la ropa que te corresponde." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
    '    Exit Sub

    'End If

  '  If UserList(Userindex).Invent.ArmourEqpObjIndex = Qui Then
     '   Call QuitarObjetos(Qui, 1, Userindex)
    '    Call DarCuerpoDesnudo(Userindex)
    '    Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Char.Body, UserList( _
                                                                                                             Userindex).OrigChar.Head, UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, _
                            UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList( _
                                                                                                     Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
       ' Dim MiObj As obj
      '  MiObj.Amount = 1
      '  MiObj.ObjIndex = dar

       ' If Not MeterItemEnInventario(Userindex, MiObj) Then
       '     Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

       ' End If

    'Else
      '  Call SendData(ToIndex, Userindex, 0, _
                      "|| No tienes la ropa del rango anterior equipada, vuelve cuando la tengas." & "´" & _
                      FontTypeNames.FONTTYPE_INFO)
        Exit Sub

  '  End If

    'pluto:2.4.7 --> poner alli:
alli:
  '  Call SendData(ToIndex, Userindex, 0, "||6°Has subido de rango en las tropas de la Legión!!!°" & str(Npclist( _
                                                                                                        UserList(Userindex).flags.TargetNpc).Char.CharIndex))
    'Call AddtoVar(UserList(UserIndex).Stats.Exp, ExpX100, MAXEXP)
    ' Call SendData(ToIndex, UserIndex, 0, "||Has ganado " & ExpX100 & " puntos de experiencia." & FONTTYPENAMES.FONTTYPE_fight)
    'UserList(Userindex).Faccion.RecompensasReal = UserList(Userindex).Faccion.RecompensasReal + 1
    'Call CheckUserLevel(UserIndex)

    Exit Sub
fallo:
    Call LogError("recompensalegion " & Err.number & " D: " & Err.Description)

End Sub


Public Sub CastigoFaccion()

Dim NumU As Integer

 For NumU = 1 To LastUser
 
    If UserList(NumU).Faccion.Castigo > 0 Then
        UserList(NumU).Faccion.Castigo = UserList(NumU).Faccion.Castigo - 1
        'Debug.Print UserList(NumU).Faccion.Castigo
        
        If UserList(NumU).Faccion.Castigo = 0 Then
        
        If UserList(NumU).raza = "Humano" Or UserList(NumU).raza = "Elfo" Or UserList(NumU).raza = "Enano" Or UserList(NumU).raza = "Gnomo" Or UserList(NumU).raza = "Tauros" Or UserList(NumU).raza = "Abisario" Then
        UserList(NumU).Faccion.FuerzasCaos = 0
        UserList(NumU).Faccion.ArmadaReal = 1
        UserList(NumU).Faccion.SoyReal = 1
        Call SendData(ToIndex, NumU, 0, _
                    "||Tu castigo ha finalizado, espero que hayas aprendido algo de el." & "´" & _
                    FontTypeNames.FONTTYPE_WARNING)
    
        ElseIf UserList(NumU).raza = "Orco" Or UserList(NumU).raza = "Licantropos" Or UserList(NumU).raza = "Vampiro" Or UserList(NumU).raza = "Goblin" Or UserList(NumU).raza = "NoMuerto" Or UserList(NumU).raza = "Elfo Oscuro" Then
        UserList(NumU).Faccion.ArmadaReal = 0
        UserList(NumU).Faccion.FuerzasCaos = 1
        UserList(NumU).Faccion.SoyCaos = 1
        Call SendData(ToIndex, NumU, 0, _
                    "||Tu castigo ha finalizado, espero que hayas aprendido algo de el." & "´" & _
                    FontTypeNames.FONTTYPE_WARNING)
        
        'End If
        
            'If UserList(NumU).Faccion.SoyCaos = 1 Then
             '   UserList(NumU).Faccion.FuerzasCaos = 1
              '  UserList(NumU).Faccion.ArmadaReal = 0
            'Call SendData(ToIndex, NumU, 0, _
                    "||Tu castigo ha finalizado, espero que hayas aprendido algo de el." & "´" & _
                    FontTypeNames.FONTTYPE_WARNING)
            'ElseIf UserList(NumU).Faccion.SoyReal = 1 Then
             '   UserList(NumU).Faccion.ArmadaReal = 1
            'Call SendData(ToIndex, NumU, 0, _
                    "||Tu castigo ha finalizado, espero que hayas aprendido algo de el." & "´" & _
                    FontTypeNames.FONTTYPE_WARNING)
    
            End If
        End If
    End If
    
    Next NumU


End Sub

Public Sub ExpulsarFaccionReal(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).Faccion.ArmadaReal = 0
    'UserList(Userindex).Faccion.CriminalesMatados = 0
    UserList(Userindex).Faccion.ArmadaReal = 2
    Call SendData(ToIndex, Userindex, 0, "||Has sido expulsado de la Alianza.!!!." & "´" & _
                                         FontTypeNames.FONTTYPE_FIGHT)
    Exit Sub
fallo:
    Call LogError("expulsarfaccionreal " & Err.number & " D: " & Err.Description)

End Sub

Public Sub ExpulsarFaccionlegion(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).Faccion.ArmadaReal = 0
    Call SendData(ToIndex, Userindex, 0, "||Has sido expulsado del Gremio Neutral.!!!." & "´" & _
                                         FontTypeNames.FONTTYPE_FIGHT)
    Exit Sub
fallo:
    Call LogError("expulsarfaccionlegion " & Err.number & " D: " & Err.Description)

End Sub

Public Function Titulolegion(ByVal Userindex As Integer) As String

    On Error GoTo fallo

    Select Case UserList(Userindex).Faccion.RecompensasReal

    Case 0
        Titulolegion = "Aprendiz Mercenario"

    Case 1
        Titulolegion = "Cazarrecompensas"

    Case 2
        Titulolegion = "Cazarrecompensas de Bronce"

    Case 3
        Titulolegion = "Cazarrecompensas de Plata"

    Case 4
        Titulolegion = "Cazarrecompensas de Oro"

    Case 5
        Titulolegion = "Cazarrecompensas de Platino"

    Case 6
        Titulolegion = "Cazarrecompensas de Diamante"

    Case 7
        Titulolegion = "Cazarrecompensas Profesional"

    Case 8
        Titulolegion = "Rey de Bestias"

    Case Else
        Titulolegion = "Rey de Bestias Legendario"

    End Select

    Exit Function
fallo:
    Call LogError("titulolegion " & Err.number & " D: " & Err.Description)

End Function

Public Function TituloReal(ByVal Userindex As Integer) As String

    On Error GoTo fallo

    Select Case UserList(Userindex).Faccion.RecompensasReal
    
    Case 0
        TituloReal = "Aprendiz Alianza"

    Case 1
        TituloReal = "Guerrero Alianza"

    Case 2
        TituloReal = "Teniente Alianza"

    Case 3
        TituloReal = "Capitán Alianza"

    Case 4
        TituloReal = "Comandante Alianza"

    Case 5
        TituloReal = "General Alianza"

    Case 6
        TituloReal = "Elite Alianza"

    Case 7
        TituloReal = "Protector Alianza"

    Case 8
        TituloReal = "Caballero Alianza"

    Case 9
        TituloReal = "Escolta Alianza"

    Case Else
        TituloReal = "Lider Alianza"

    End Select

    Exit Function
fallo:
    Call LogError("tituloreal " & Err.number & " D: " & Err.Description)

End Function

Public Sub EnlistarCaosN(ByVal Userindex As Integer)

    On Error GoTo fallo

    'If Not Criminal(Userindex) Then
       ' Call SendData(ToIndex, Userindex, 0, "||6°Largate de aqui, bufon!!!!°" & str(Npclist(UserList( _
                                                                                             Userindex).flags.TargetNpc).Char.CharIndex))
        'Exit Sub

    'End If
    

    If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||6°Ya perteneces a las tropas de la Horda!!!°" & str(Npclist(UserList( _
                                                                                                         Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    If UserList(Userindex).Faccion.ArmadaReal = 1 Then
        Call SendData(ToIndex, Userindex, 0, _
                      "||6°Las Horda reinara en Argentum, largate de aqui estupido Alianza.!!!°" & str(Npclist( _
                                                                                                            UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    If UserList(Userindex).Faccion.RecibioExpInicialReal > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||6°No queremos antiguos miembros de la Alianza en nuestras filas.°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'pluto:hoy
    If UserList(Userindex).Faccion.RecibioExpInicialCaos > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||6°No queremos antiguos miembros de la Horda en nuestras filas.°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'If Not Criminal(Userindex) Then
       ' Call SendData(ToIndex, Userindex, 0, "||6°Ja ja ja tu no eres bienvenido aqui!!!°" & str(Npclist(UserList( _
                                                                                                         Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

    'End If

    'If UserList(Userindex).Faccion.CiudadanosMatados < 0 Then
        'Call SendData(ToIndex, Userindex, 0, _
                      "||6°Para unirte a nuestras fuerzas debes matar al menos 10 ciudadanos, solo has matado " & UserList( _
                      Userindex).Faccion.CiudadanosMatados & "°" & str(Npclist(UserList( _
                                                                               Userindex).flags.TargetNpc).Char.CharIndex))
        'Exit Sub

    'End If

   ' If UserList(Userindex).Stats.ELV < 30 Then
       ' Call SendData(ToIndex, Userindex, 0, "||6°Para unirte a nuestras fuerzas debes ser al menos de nivel 30!!!°" _
                                             & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

   ' End If
   
   UserList(Userindex).Reputacion.AsesinoRep = 100000
   UserList(Userindex).Reputacion.BandidoRep = 100000
   UserList(Userindex).Reputacion.LadronesRep = 100000

    UserList(Userindex).Faccion.FuerzasCaos = 1
    UserList(Userindex).Faccion.ArmadaReal = 0
    'pluto:2.4.7 --> enlistar con muertes justas
    'UserList(Userindex).Faccion.RecompensasCaos = UserList(Userindex).Faccion.CiudadanosMatados \ 100
    UserList(Userindex).Faccion.RecompensasCaos = 0

    'Call SendData(ToIndex, Userindex, 0, _
                  "||6°Bienvenido a al lado oscuro!!!, aqui tienes tu armadura. Por cada centena de ciudadanos que acabes te dare un recompensa, buena suerte soldado!°" _
                  & (UserList(Userindex).Char.CharIndex))
                  
        Call SendData(ToIndex, Userindex, 0, _
                  "||Bienvenido a la Horda!!! Cuando mates 10 Alianzas, dirigete a Ciudad Caos por tu recompensa, buena suerte soldado!" & "´" & FontTypeNames.FONTTYPE_INFO)
                  

    'If UserList(Userindex).Faccion.RecibioArmaduraCaos = 0 Then
       ' Dim MiObjx As obj
        'MiObjx.Amount = 1

        'If UserList(Userindex).clase = "MAGO" Or UserList(Userindex).clase = "DRUIDA" Then
         '   MiObjx.ObjIndex = TunicaMagoCaos

            'pluto:2.4.7 --> Poner genero
           ' If UserList(Userindex).Genero = "MUJER" Then MiObjx.ObjIndex = 509

            'pluto:7.0 GOBLIN
           ' If UserList(Userindex).raza = "ENANO" Or UserList(Userindex).raza = "GNOMO" Or _
            '   UserList(Userindex).raza = "GOBLIN" Then
            '    MiObjx.ObjIndex = 524    'TunicaMagoCaosEnanos

           ' End If

        'ElseIf UserList(Userindex).clase = "GUERRERO" Or UserList(Userindex).clase = "PALADIN" Then

           ' If UserList(Userindex).raza = "ENANO" Or UserList(Userindex).raza = "GNOMO" Or _
            '   UserList(Userindex).raza = "GOBLIN" Then
             '   MiObjx.ObjIndex = ArmaduraCaos3
            'Else
             '   MiObjx.ObjIndex = ArmaduraCaos1

            'End If

       ' Else

          '  If UserList(Userindex).raza = "ENANO" Or UserList(Userindex).raza = "GNOMO" Or _
           '    UserList(Userindex).raza = "GOBLIN" Then
            '    MiObjx.ObjIndex = 957
           ' Else
            '    MiObjx.ObjIndex = ArmaduraCaos2

           ' End If

       ' End If

       ' If Not MeterItemEnInventario(Userindex, MiObjx) Then
        '    Call TirarItemAlPiso(UserList(Userindex).Pos, MiObjx)

       ' End If

       ' UserList(Userindex).Faccion.RecibioArmaduraCaos = 1

   ' End If

   ' If UserList(Userindex).Faccion.RecibioExpInicialCaos = 0 Then
     '   Call AddtoVar(UserList(Userindex).Stats.exp, ExpAlUnirse, MAXEXP)
      '  Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpAlUnirse & " puntos de experiencia." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
       ' UserList(Userindex).Faccion.RecibioExpInicialCaos = 1
    '    Call CheckUserLevel(Userindex)

    'End If

    Call LogEjercitoCaos(UserList(Userindex).Name)
    Exit Sub
fallo:
    Call LogError("enlistarcaos " & Err.number & " D: " & Err.Description)

End Sub

Public Sub EnlistarCaos(ByVal Userindex As Integer)

    On Error GoTo fallo

    'If Not Criminal(Userindex) Then
       ' Call SendData(ToIndex, Userindex, 0, "||6°Largate de aqui, bufon!!!!°" & str(Npclist(UserList( _
                                                                                             Userindex).flags.TargetNpc).Char.CharIndex))
        'Exit Sub

    'End If

    If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
        Call SendData(ToIndex, Userindex, 0, "||6°Ya perteneces a las tropas de la Horda!!!°" & str(Npclist(UserList( _
                                                                                                         Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    If UserList(Userindex).Faccion.ArmadaReal = 1 Then
        Call SendData(ToIndex, Userindex, 0, _
                      "||6°Las Horda reinara en Argentum, largate de aqui estupido Alianza.!!!°" & str(Npclist( _
                                                                                                            UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    If UserList(Userindex).Faccion.RecibioExpInicialReal > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||6°No queremos antiguos miembros de la Alianza en nuestras filas.°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'pluto:hoy
    If UserList(Userindex).Faccion.RecibioExpInicialCaos > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||6°No queremos antiguos miembros de la Horda en nuestras filas.°" & str( _
                                             Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'If Not Criminal(Userindex) Then
       ' Call SendData(ToIndex, Userindex, 0, "||6°Ja ja ja tu no eres bienvenido aqui!!!°" & str(Npclist(UserList( _
                                                                                                         Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

    'End If

    'If UserList(Userindex).Faccion.CiudadanosMatados < 0 Then
        'Call SendData(ToIndex, Userindex, 0, _
                      "||6°Para unirte a nuestras fuerzas debes matar al menos 10 ciudadanos, solo has matado " & UserList( _
                      Userindex).Faccion.CiudadanosMatados & "°" & str(Npclist(UserList( _
                                                                               Userindex).flags.TargetNpc).Char.CharIndex))
        'Exit Sub

    'End If

   ' If UserList(Userindex).Stats.ELV < 30 Then
       ' Call SendData(ToIndex, Userindex, 0, "||6°Para unirte a nuestras fuerzas debes ser al menos de nivel 30!!!°" _
                                             & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))
       ' Exit Sub

   ' End If
   
   UserList(Userindex).Reputacion.AsesinoRep = 100000
   UserList(Userindex).Reputacion.BandidoRep = 100000
   UserList(Userindex).Reputacion.LadronesRep = 100000

    UserList(Userindex).Faccion.FuerzasCaos = 1
    UserList(Userindex).Faccion.ArmadaReal = 0
    'pluto:2.4.7 --> enlistar con muertes justas
    'UserList(Userindex).Faccion.RecompensasCaos = UserList(Userindex).Faccion.CiudadanosMatados \ 100
    UserList(Userindex).Faccion.RecompensasCaos = 0

    Call SendData(ToIndex, Userindex, 0, _
                  "||6°Bienvenido a la Horda!!! Cuando mates 10 Alianzas, dirigete a Ciudad Caos por tu recompensa, buena suerte soldado!°" _
                  & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

    'If UserList(Userindex).Faccion.RecibioArmaduraCaos = 0 Then
     '   Dim MiObj As obj
      '  MiObj.Amount = 1

       ' If UCase$(UserList(Userindex).clase) = "MAGO" Or UCase$(UserList(Userindex).clase) = "DRUIDA" Then
        '    MiObj.ObjIndex = TunicaMagoCaos

            'pluto:2.4.7 --> Poner genero
         '   If UCase$(UserList(Userindex).Genero) = "MUJER" Then MiObj.ObjIndex = 509

            'pluto:7.0 GOBLIN
          '  If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
           '    UserList(Userindex).raza) = "GOBLIN" Then
            '    MiObj.ObjIndex = 524    'TunicaMagoCaosEnanos

            'End If

    '    ElseIf UCase$(UserList(Userindex).clase) = "GUERRERO" Or UCase$(UserList(Userindex).clase) = "PALADIN" Then

          '  If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
          '     UserList(Userindex).raza) = "GOBLIN" Then
          '      MiObj.ObjIndex = ArmaduraCaos3
          '  Else
          '      MiObj.ObjIndex = ArmaduraCaos1

          '  End If

       ' Else

         '   If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
          '     UserList(Userindex).raza) = "GOBLIN" Then
           '     MiObj.ObjIndex = 957
            'Else
             '   MiObj.ObjIndex = ArmaduraCaos2

        '    End If

      '  End If

      '  If Not MeterItemEnInventario(Userindex, MiObj) Then
       '     Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        'End If

        'UserList(Userindex).Faccion.RecibioArmaduraCaos = 1

   ' End If

   ' If UserList(Userindex).Faccion.RecibioExpInicialCaos = 0 Then
    '    Call AddtoVar(UserList(Userindex).Stats.exp, ExpAlUnirse, MAXEXP)
     '   Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpAlUnirse & " puntos de experiencia." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
      '  UserList(Userindex).Faccion.RecibioExpInicialCaos = 1
       ' Call CheckUserLevel(Userindex)
        'Call senduserstatsbox(Userindex)

    'End If

    Call LogEjercitoCaos(UserList(Userindex).Name)
    Exit Sub
fallo:
    Call LogError("enlistarcaos " & Err.number & " D: " & Err.Description)

End Sub

Public Sub RecompensaCaos(ByVal Userindex As Integer)

    On Error GoTo fallo

    If UserList(Userindex).Faccion.CiudadanosMatados < 10 Then
        Call SendData(ToIndex, Userindex, 0, _
                      "||6°Para tu primera recompensa debes matar al menos 10 Alianzas, solo has matado " & UserList( _
                      Userindex).Faccion.CiudadanosMatados & "°" & str(Npclist(UserList( _
                                                                               Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If
    
    If UserList(Userindex).Faccion.RecompensasCaos = 0 Then
    
    UserList(Userindex).Faccion.RecompensasCaos = 1
    
    Call SendData(ToIndex, Userindex, 0, _
                  "||6°Aqui tienes tu armadura. Por cada 30 Alianzas que acabes te dare un recompensa, buena suerte soldado!°" _
                  & str(Npclist(UserList(Userindex).flags.TargetNpc).Char.CharIndex))

    If UserList(Userindex).Faccion.RecibioArmaduraCaos = 0 Then
        Dim MiObj As obj
        MiObj.Amount = 1

        If UCase$(UserList(Userindex).clase) = "MAGO" Or UCase$(UserList(Userindex).clase) = "DRUIDA" Then
            MiObj.ObjIndex = TunicaMagoCaos

            'pluto:2.4.7 --> Poner genero
            If UCase$(UserList(Userindex).Genero) = "MUJER" Then MiObj.ObjIndex = 509

            'pluto:7.0 GOBLIN
            If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
               UserList(Userindex).raza) = "GOBLIN" Then
                MiObj.ObjIndex = 524    'TunicaMagoCaosEnanos

            End If

        ElseIf UCase$(UserList(Userindex).clase) = "GUERRERO" Or UCase$(UserList(Userindex).clase) = "PALADIN" Then

            If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
               UserList(Userindex).raza) = "GOBLIN" Then
                MiObj.ObjIndex = ArmaduraCaos3
            Else
                MiObj.ObjIndex = ArmaduraCaos1

            End If

        Else

            If UCase$(UserList(Userindex).raza) = "ENANO" Or UCase$(UserList(Userindex).raza) = "GNOMO" Or UCase$( _
               UserList(Userindex).raza) = "GOBLIN" Then
                MiObj.ObjIndex = 957
            Else
                MiObj.ObjIndex = ArmaduraCaos2

            End If

        End If

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        End If

        UserList(Userindex).Faccion.RecibioArmaduraCaos = 1

    End If

    If UserList(Userindex).Faccion.RecibioExpInicialCaos = 0 Then
        Call AddtoVar(UserList(Userindex).Stats.exp, ExpAlUnirse, MAXEXP)
        Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpAlUnirse & " puntos de experiencia." & "´" & _
                                             FontTypeNames.FONTTYPE_FIGHT)
        UserList(Userindex).Faccion.RecibioExpInicialCaos = 1
        Call CheckUserLevel(Userindex)
        Call senduserstatsbox(Userindex)

    End If
    
    Exit Sub
    
    End If

    
    
    'finn
    
    If UserList(Userindex).Faccion.CiudadanosMatados \ 30 <= UserList(Userindex).Faccion.RecompensasCaos Then
        Call SendData(ToIndex, Userindex, 0, _
                      "||6°Ya has recibido tu recompensa, mata 30 Alianzas mas para recibir la proxima!!!°" & str(Npclist( _
                                                                                                                    UserList(Userindex).flags.TargetNpc).Char.CharIndex))
        Exit Sub

    End If

    'pluto:2.3
    Dim dar As Integer
    Dim Qui As Integer
    Dim recibida As Byte
    Dim clase As String
    Dim raza As String
    Dim Genero As String
    Dim recompensa As Byte
    'Dim alli As Byte
    recibida = UserList(Userindex).Faccion.RecibioArmaduraCaos
    recompensa = UserList(Userindex).Faccion.RecompensasCaos
    clase = UCase$(UserList(Userindex).clase)
    raza = UCase$(UserList(Userindex).raza)
    Genero = UCase$(UserList(Userindex).Genero)

    If recompensa <> 4 And recompensa <> 7 Then GoTo alli

    Select Case recompensa

    Case 4

        If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

            If clase = "MAGO" Or clase = "DRUIDA" Then
                dar = 562
                Qui = 524
            ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then
                dar = 615
                Qui = 593
            Else
                dar = 958
                Qui = 957

            End If

        Else    'raza

            If clase = "MAGO" Or clase = "DRUIDA" Then

                Select Case Genero

                Case "HOMBRE"
                    dar = 613
                    Qui = 518

                Case "MUJER"
                    dar = 613
                    Qui = 509
                End Select    'GENERO

            ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then

                Select Case Genero

                Case "HOMBRE"
                    dar = 808
                    Qui = 379

                Case "MUJER"
                    dar = 494
                    Qui = 379

                End Select    'GENERO

            Else

                Select Case Genero

                Case "HOMBRE"
                    dar = 614
                    Qui = 523

                Case "MUJER"
                    dar = 614
                    Qui = 523
                End Select    'GENERO

            End If    'CLASE

        End If    'RAZA

    Case 7

        If raza = "ENANO" Or raza = "GNOMO" Or raza = "GOBLIN" Then

            If clase = "MAGO" Or clase = "DRUIDA" Then
                dar = 739
                Qui = 562
            ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then
                dar = 953
                Qui = 615
            Else
                dar = 959
                Qui = 958
            End If    'CLASE

        Else    'RAZA no enana

            If clase = "MAGO" Or clase = "DRUIDA" Then

                Select Case Genero

                Case "HOMBRE"
                    dar = 714
                    Qui = 613

                Case "MUJER"
                    dar = 380
                    Qui = 613
                End Select    'GENERO

            ElseIf clase = "GUERRERO" Or clase = "PALADIN" Then

                Select Case Genero

                Case "HOMBRE"
                    dar = 617
                    Qui = 808

                Case "MUJER"
                    dar = 617
                    Qui = 494

                End Select    'GENERO

            Else

                Select Case Genero

                Case "HOMBRE"
                    dar = 954
                    Qui = 614

                Case "MUJER"
                    dar = 954
                    Qui = 614
                End Select    'GENERO

            End If    'CLASE

        End If    'RAZA

    End Select    'recompensa

    'comprueba objeto y lo cambia
    If dar = 0 Or Qui = 0 Then
        Call SendData(ToIndex, Userindex, 0, "|| No existe la ropa que te corresponde." & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    Dim Slot As Integer

    If UserList(Userindex).Invent.ArmourEqpObjIndex = Qui Then
        Slot = UserList(Userindex).Invent.ArmourEqpSlot
        Call QuitarUserInvItem(Userindex, Slot, 1)
        Call UpdateUserInv(False, Userindex, Slot)

        'Call QuitarObjetos(Qui, 1, UserIndex)
        Call DarCuerpoDesnudo(Userindex)
        Call ChangeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Char.Body, UserList( _
                                                                                                             Userindex).OrigChar.Head, UserList(Userindex).Char.Heading, UserList(Userindex).Char.WeaponAnim, _
                            UserList(Userindex).Char.ShieldAnim, UserList(Userindex).Char.CascoAnim, UserList( _
                                                                                                     Userindex).Char.Botas, UserList(Userindex).Char.AlasAnim)
        
        MiObj.Amount = 1
        MiObj.ObjIndex = dar

        If Not MeterItemEnInventario(Userindex, MiObj) Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, MiObj)

        End If

    Else
        Call SendData(ToIndex, Userindex, 0, _
                      "|| No tienes la ropa del rango anterior equipada, vuelve cuando la tengas." & "´" & _
                      FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

alli:
    Call SendData(ToIndex, Userindex, 0, "||6°Aqui tienes tu recompensa noble guerrero!!!°" & str(Npclist(UserList( _
                                                                                                          Userindex).flags.TargetNpc).Char.CharIndex))
    Call AddtoVar(UserList(Userindex).Stats.exp, ExpX100, MAXEXP)
    Call SendData(ToIndex, Userindex, 0, "||Has ganado " & ExpX100 & " puntos de experiencia." & "´" & _
                                         FontTypeNames.FONTTYPE_FIGHT)
    UserList(Userindex).Faccion.RecompensasCaos = UserList(Userindex).Faccion.RecompensasCaos + 1
    Call CheckUserLevel(Userindex)
    Call senduserstatsbox(Userindex)

    Exit Sub
fallo:
    Call LogError("recompensacaos " & Err.number & " D: " & Err.Description)

End Sub

Public Sub ExpulsarCaos(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).Faccion.FuerzasCaos = 0
    UserList(Userindex).Faccion.ArmadaReal = 2
    Call SendData(ToIndex, Userindex, 0, "||Has sido expulsado del ejercito de la Horda!!!." & "´" & _
                                         FontTypeNames.FONTTYPE_FIGHT)

    Exit Sub
fallo:
    Call LogError("expulsarcaos " & Err.number & " D: " & Err.Description)

End Sub

Public Function TituloCaos(ByVal Userindex As Integer) As String

    On Error GoTo fallo

    Select Case UserList(Userindex).Faccion.RecompensasCaos
    
    Case 0
        TituloCaos = "Aprendiz Horda"

    Case 1
        TituloCaos = "Guerrero Horda"

    Case 2
        TituloCaos = "Teniente Horda"

    Case 3
        TituloCaos = "Capitán Horda"

    Case 4
        TituloCaos = "Comandante Horda"

    Case 5
        TituloCaos = "General Horda"

    Case 6
        TituloCaos = "Elite Horda"

    Case 7
        TituloCaos = "Asolador de la Horda"

    Case 8
        TituloCaos = "Caballero Horda"

    Case 9
        TituloCaos = "Asesino Horda"

    Case Else
        TituloCaos = "Lider Horda"

    End Select

    Exit Function
fallo:
    Call LogError("titulocaos " & Err.number & " D: " & Err.Description)

End Function

