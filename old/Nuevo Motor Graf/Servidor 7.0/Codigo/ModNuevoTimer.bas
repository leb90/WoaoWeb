Attribute VB_Name = "ModNuevoTimer"

' Las siguientes funciones devuelven TRUE o FALSE si el intervalo
' permite hacerlo. Si devuelve TRUE, setean automaticamente el
' timer para que no se pueda hacer la accion hasta el nuevo ciclo.
'

' CASTING DE HECHIZOS
Public Function IntervaloPermiteLanzarSpell(ByVal Userindex As Integer, _
                                            Optional ByVal Actualizar As Boolean = True) As Boolean
    Dim TActual As Long

    TActual = GetTickCount() And &H7FFFFFFF
    'pluto: 6.9
    Dim Rapidos As Long
    Rapidos = TActual - UserList(Userindex).Counters.TimerLanzarSpell

    If Rapidos < TOPELANZAR Then
        Call SendData(ToGM, 0, 0, "||" & UserList(Userindex).Name & " lanza en:" & Rapidos & "´" & _
                                  FontTypeNames.FONTTYPE_talk)
        Call LogCasino("Lanza: " & UserList(Userindex).Name & " HD: " & UserList(Userindex).Serie & " en " & Rapidos)

    End If

    If Rapidos >= 40 * IntervaloUserPuedeCastear Then
        If Actualizar Then UserList(Userindex).Counters.TimerLanzarSpell = TActual
        IntervaloPermiteLanzarSpell = True
    Else
        IntervaloPermiteLanzarSpell = False

    End If

End Function

Public Function IntervaloPermiteAtacar(ByVal Userindex As Integer, _
                                       Optional ByVal Actualizar As Boolean = True) As Boolean
    Dim TActual As Long

    TActual = GetTickCount() And &H7FFFFFFF

    If TActual - UserList(Userindex).Counters.TimerPuedeAtacar >= IntervaloUserPuedeAtacar Then
        If Actualizar Then UserList(Userindex).Counters.TimerPuedeAtacar = TActual
        IntervaloPermiteAtacar = True
    Else
        IntervaloPermiteAtacar = False

    End If

End Function

' TRABAJO
Public Function IntervaloPermiteTrabajar(ByVal Userindex As Integer, _
                                         Optional ByVal Actualizar As Boolean = True) As Boolean
    Dim TActual As Long

    TActual = GetTickCount() And &H7FFFFFFF

    If TActual - UserList(Userindex).Counters.TimerPuedeTrabajar >= 40 * IntervaloUserPuedeTrabajar Then
        If Actualizar Then UserList(Userindex).Counters.TimerPuedeTrabajar = TActual
        IntervaloPermiteTrabajar = True
    Else
        IntervaloPermiteTrabajar = False

    End If

End Function

' USAR OBJETOS
Public Function IntervaloPermiteUsar(ByVal Userindex As Integer, _
                                     Optional ByVal Actualizar As Boolean = True) As Boolean
    Dim TActual As Long

    TActual = GetTickCount() And &H7FFFFFFF

    If TActual - UserList(Userindex).Counters.TimerUsar >= IntervaloUserPuedeUsar Then
        If Actualizar Then UserList(Userindex).Counters.TimerUsar = TActual
        IntervaloPermiteUsar = True
    Else
        IntervaloPermiteUsar = False

    End If

End Function

Public Function IntervaloPermiteUsarArcos(ByVal Userindex As Integer, _
                                          Optional ByVal Actualizar As Boolean = True) As Boolean
    Dim TActual As Long

    TActual = GetTickCount() And &H7FFFFFFF
    Dim Rapidos As Long
    Rapidos = TActual - UserList(Userindex).Counters.TimerUsarArco

    If Rapidos < TOPEFLECHA Then
        Call SendData(ToGM, 0, 0, "||" & UserList(Userindex).Name & " tira flecha en:" & Rapidos & "´" & _
                                  FontTypeNames.FONTTYPE_talk)
        Call LogCasino("Flecha: " & UserList(Userindex).Name & " HD: " & UserList(Userindex).Serie & " en " & Rapidos)

    End If

    If TActual - UserList(Userindex).Counters.TimerUsarArco >= IntervaloUserPuedeFlechas Then
        If Actualizar Then UserList(Userindex).Counters.TimerUsarArco = TActual
        IntervaloPermiteUsarArcos = True
    Else
        IntervaloPermiteUsarArcos = False

    End If

End Function

Public Function IntervaloPermiteTomar(ByVal Userindex As Integer, _
                                      Optional ByVal Actualizar As Boolean = True) As Boolean
    Dim TActual As Long

    TActual = GetTickCount() And &H7FFFFFFF

    If TActual - UserList(Userindex).Counters.TimerTomar >= 40 * IntervaloUserPuedeTomar Then
        If Actualizar Then UserList(Userindex).Counters.TimerTomar = TActual
        IntervaloPermiteTomar = True
    Else
        IntervaloPermiteTomar = False

    End If

End Function

