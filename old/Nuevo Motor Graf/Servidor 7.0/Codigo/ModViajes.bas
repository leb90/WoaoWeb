Attribute VB_Name = "ModViajes"

Sub SistemaViajes(ByVal Userindex As Integer, rdata As String)

'On Error GoTo fallo
    If Npclist(UserList(Userindex).flags.TargetNpc).NPCtype <> NPCTYPE_VIAJERO Then Exit Sub

    '¿Esta en NIX?
    If UserList(Userindex).Pos.Map = 34 Then
        If rdata = "ULLA" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 1, 50, 50, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "CAOS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 170, 23, 78, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "DESCANSO" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 81, 85, 58, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "ATLANTIS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 85, 70, 43, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

    End If

    '¿Esta en Ulla?
    If UserList(Userindex).Pos.Map = 1 Then
        If rdata = "NIX" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 34, 57, 79, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "CAOS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 170, 23, 78, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "DESCANSO" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 81, 85, 58, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "BANDER" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 59, 51, 44, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "RINKEL" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 20, 29, 92, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

    End If

    '¿Esta en Descanso?
    If UserList(Userindex).Pos.Map = 81 Then
        If rdata = "NIX" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 34, 57, 79, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "BANDER" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 59, 51, 44, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "ULLA" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 1, 50, 50, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "CAOS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 170, 23, 78, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "ARGHAL" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 150, 35, 29, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

    End If

    '¿Esta en Rinkel?
    If UserList(Userindex).Pos.Map = 20 Then
        If rdata = "ULLA" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 1, 50, 50, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "LINDOS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 63, 54, 14, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "ATLANTIS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 85, 70, 43, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "ESPERANZA" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 111, 86, 76, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

    End If

    '¿Esta en CAOS?
    If UserList(Userindex).Pos.Map = 170 Then
        If rdata = "NIX" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 34, 57, 79, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "ULLA" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else
                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 1, 50, 50, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

        If rdata = "LINDOS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 63, 54, 14, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "DESCANSO" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                'le quitamos la stamina
                UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList(Userindex).Stats.MinSta
                'le ponemos el hambre y la sed a 0
                'UserList(Userindex).Stats.MinAGU = 0
                'UserList(Userindex).Stats.MinHam = 0
                Viaje = 0
                Call WarpUserChar(Userindex, 81, 85, 58, True)
                UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje

            End If

        End If

    End If

    '¿Esta en ARGHAL?
    If UserList(Userindex).Pos.Map = 151 Then
        If rdata = "DESCANSO" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 81, 36, 86, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "BANDER" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 59, 50, 50, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

    End If

    '¿Esta en ATLANTIS?
    If UserList(Userindex).Pos.Map = 85 Then
        If rdata = "NIX" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 34, 50, 50, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "BANDER" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 59, 50, 50, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "RINKEL" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 20, 16, 86, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

    End If

    '¿Esta en LINDOS?
    If UserList(Userindex).Pos.Map = 63 Then
        If rdata = "RINKEL" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 20, 16, 86, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "ESPERANZA" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 111, 86, 76, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "CAOS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 170, 24, 78, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

    End If

    '¿Esta en ESPERANZA?
    If UserList(Userindex).Pos.Map = 111 Then
        If rdata = "LINDOS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 63, 54, 14, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "RINKEL" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 20, 16, 86, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

    End If

    '¿Esta en BANDER?
    If UserList(Userindex).Pos.Map = 59 Then
        If rdata = "ULLA" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 1, 50, 50, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "DESCANSO" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 81, 38, 86, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "ATLANTIS" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 85, 70, 43, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

        If rdata = "ARGHAL" Then
            Viaje = 0

            If UserList(Userindex).Stats.GLD < Viaje Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes " & Viaje & " oros para viajar a " & rdata & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
                Exit Sub
            Else

                If UserList(Userindex).Stats.MinAGU < 1 Or UserList(Userindex).Stats.MinHam < 1 Or UserList( _
                   Userindex).Stats.MinSta < 1 Then
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||¡¡Apenas tienes energias, vuelve cuando estes preparado!!" & "´" & _
                                  FontTypeNames.FONTTYPE_INFO)
                    Exit Sub

                End If

                If TieneObjetos(474, 1, Userindex) Or TieneObjetos(475, 1, Userindex) Or TieneObjetos(476, 1, _
                                                                                                      Userindex) And UserList(Userindex).Stats.UserSkills(Navegacion) > 40 Then
                    'le quitamos la stamina
                    UserList(Userindex).Stats.MinSta = UserList(Userindex).Stats.MinSta - UserList( _
                                                       Userindex).Stats.MinSta
                    'le ponemos el hambre y la sed a 0
                    'UserList(Userindex).Stats.MinAGU = 0
                    'UserList(Userindex).Stats.MinHam = 0
                    Viaje = 0
                    Call WarpUserChar(Userindex, 150, 35, 29, True)
                    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - Viaje
                Else
                    Call SendData(ToIndex, Userindex, 0, _
                                  "||Para viajar a una isla, necesitaras una embarcación y 40 puntos en navegación  " & "´" _
                                  & FontTypeNames.FONTTYPE_INFO)

                End If

            End If

        End If

    End If

    Call EnviarHambreYsed(Userindex)

    'fallo:
    'Call LogError("sistemaviajes" & Err.number & " D: " & Err.Description)

End Sub
