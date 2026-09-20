Attribute VB_Name = "SistemaCombate"
Option Explicit

Public Const MAXDISTANCIAARCO = 12

Function ModificadorEvasion(ByVal clase As String) As Single

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "GUERRERO"
        ModificadorEvasion = 0.9

    Case "CAZADOR"
        ModificadorEvasion = 0.8

    Case "PALADIN"
        ModificadorEvasion = 0.8

    Case "BANDIDO"
        ModificadorEvasion = 0.8

    Case "ASESINO"
        ModificadorEvasion = 1.1

    Case "PIRATA"
        ModificadorEvasion = 0.8

    Case "LADRON"
        ModificadorEvasion = 1

    Case "BARDO"
        ModificadorEvasion = 1

    Case "MAGO"
        ModificadorEvasion = 0.5

    Case Else
        ModificadorEvasion = 0.7

    End Select

    Exit Function
fallo:
    Call LogError("modificadorevasion " & Err.number & " D: " & Err.Description)

End Function

Function ModificadorPoderAtaqueArmas(ByVal clase As String) As Single

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "GUERRERO"
        ModificadorPoderAtaqueArmas = 1

    Case "CAZADOR"
        ModificadorPoderAtaqueArmas = 0.8

    Case "PALADIN"
        ModificadorPoderAtaqueArmas = 0.85

    Case "ASESINO"
        ModificadorPoderAtaqueArmas = 0.8

    Case "PIRATA"
        ModificadorPoderAtaqueArmas = 0.9

    Case "LADRON"
        ModificadorPoderAtaqueArmas = 0.75

    Case "BANDIDO"
        ModificadorPoderAtaqueArmas = 0.85

    Case "CLERIGO"
        ModificadorPoderAtaqueArmas = 0.65

    Case "BARDO"
        ModificadorPoderAtaqueArmas = 0.85

    Case "DRUIDA"
        ModificadorPoderAtaqueArmas = 0.65

    Case "PESCADOR"
        ModificadorPoderAtaqueArmas = 0.6

    Case "LEÑADOR"
        ModificadorPoderAtaqueArmas = 0.6

    Case "MINERO"
        ModificadorPoderAtaqueArmas = 0.6

    Case "HERRERO"
        ModificadorPoderAtaqueArmas = 0.6

    Case "CARPINTERO"
        ModificadorPoderAtaqueArmas = 0.6

    Case "ERMITAÑO"
        ModificadorPoderAtaqueArmas = 0.6

    Case "MAGO"
        ModificadorPoderAtaqueArmas = 0.5

    Case Else
        ModificadorPoderAtaqueArmas = 0.6

    End Select

    Exit Function
fallo:
    Call LogError("modificadorpoderataquearmas " & Err.number & " D: " & Err.Description)

End Function

Function ModificadorPoderAtaqueProyectiles(ByVal clase As String) As Single

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "GUERRERO"
        ModificadorPoderAtaqueProyectiles = 0.8

    Case "CAZADOR"
        ModificadorPoderAtaqueProyectiles = 0.95

    Case "PALADIN"
        ModificadorPoderAtaqueProyectiles = 0.75

    Case "ASESINO"
        ModificadorPoderAtaqueProyectiles = 0.75

    Case "PIRATA"
        ModificadorPoderAtaqueProyectiles = 0.75

    Case "LADRON"
        ModificadorPoderAtaqueProyectiles = 0.8

    Case "BANDIDO"
        ModificadorPoderAtaqueProyectiles = 0.9

    Case "CLERIGO"
        ModificadorPoderAtaqueProyectiles = 0.7

    Case "BARDO"
        ModificadorPoderAtaqueProyectiles = 0.75

    Case "DRUIDA"
        ModificadorPoderAtaqueProyectiles = 0.75

    Case "PESCADOR"
        ModificadorPoderAtaqueProyectiles = 0.7

    Case "LEÑADOR"
        ModificadorPoderAtaqueProyectiles = 0.7

    Case "MINERO"
        ModificadorPoderAtaqueProyectiles = 0.7

    Case "HERRERO"
        ModificadorPoderAtaqueProyectiles = 0.7

    Case "CARPINTERO"
        ModificadorPoderAtaqueProyectiles = 0.7

    Case "ERMITAÑO"
        ModificadorPoderAtaqueProyectiles = 0.7

    Case "ARQUERO"
        ModificadorPoderAtaqueProyectiles = 1.4

    Case Else
        ModificadorPoderAtaqueProyectiles = 0.7

    End Select

    Exit Function
fallo:
    Call LogError("modificadorataqueproyectiles " & Err.number & " D: " & Err.Description)

End Function

Function ModicadorDañoClaseArmas(ByVal clase As String) As Single

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "GUERRERO"
        ModicadorDañoClaseArmas = 1.2  'nati(18.06.11): cambio el modificador del guerrero "1.1" a "1.5"

    Case "CAZADOR"
        ModicadorDañoClaseArmas = 0.9

    Case "PALADIN"
        ModicadorDañoClaseArmas = 0.9

    Case "ASESINO"
        ModicadorDañoClaseArmas = 0.8

    Case "LADRON"
        ModicadorDañoClaseArmas = 0.8

    Case "PIRATA"
        ModicadorDañoClaseArmas = 0.8

    Case "BANDIDO"
        ModicadorDañoClaseArmas = 0.8

    Case "CLERIGO"
        ModicadorDañoClaseArmas = 0.9

    Case "BARDO"
        ModicadorDañoClaseArmas = 0.8

    Case "DRUIDA"
        ModicadorDañoClaseArmas = 0.8

    Case "PESCADOR"
        ModicadorDañoClaseArmas = 0.8

    Case "LEÑADOR"
        ModicadorDañoClaseArmas = 0.8

    Case "MINERO"
        ModicadorDañoClaseArmas = 0.8

    Case "HERRERO"
        ModicadorDañoClaseArmas = 0.8

    Case "CARPINTERO"
        ModicadorDañoClaseArmas = 0.8

    Case "ERMITAÑO"
        ModicadorDañoClaseArmas = 0.8

    Case "MAGO"
        ModicadorDañoClaseArmas = 0.5

    Case Else
        ModicadorDañoClaseArmas = 0.8

    End Select

    Exit Function
fallo:
    Call LogError("modificadordañoclasearmas " & Err.number & " D: " & Err.Description)

End Function

Function ModicadorDañoClaseProyectiles(ByVal clase As String) As Single

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "GUERRERO"
        ModicadorDañoClaseProyectiles = 0.9

    Case "CAZADOR"
        ModicadorDañoClaseProyectiles = 0.9

    Case "PALADIN"
        ModicadorDañoClaseProyectiles = 0.8

    Case "ASESINO"
        ModicadorDañoClaseProyectiles = 0.75

    Case "LADRON"
        ModicadorDañoClaseProyectiles = 0.75

    Case "PIRATA"
        ModicadorDañoClaseProyectiles = 0.75

    Case "BANDIDO"
        ModicadorDañoClaseProyectiles = 0.75

    Case "CLERIGO"
        ModicadorDañoClaseProyectiles = 0.7

    Case "BARDO"
        ModicadorDañoClaseProyectiles = 0.75

    Case "DRUIDA"
        ModicadorDañoClaseProyectiles = 0.75

    Case "PESCADOR"
        ModicadorDañoClaseProyectiles = 0.7

    Case "LEÑADOR"
        ModicadorDañoClaseProyectiles = 0.7

    Case "MINERO"
        ModicadorDañoClaseProyectiles = 0.7

    Case "HERRERO"
        ModicadorDañoClaseProyectiles = 0.7

    Case "CARPINTERO"
        ModicadorDañoClaseProyectiles = 0.7

    Case "ERMITAÑO"
        ModicadorDañoClaseProyectiles = 0.7

    Case "ARQUERO"
        ModicadorDañoClaseProyectiles = 1.1    '' modificado de 1.3

    Case Else
        ModicadorDañoClaseProyectiles = 0.7

    End Select

    Exit Function
fallo:
    Call LogError("modificadordañoclaseproyectiles " & Err.number & " D: " & Err.Description)

End Function

Function ModEvasionDeEscudoClase(ByVal clase As String) As Single

    On Error GoTo fallo

    Select Case UCase$(clase)

    Case "GUERRERO"
        ModEvasionDeEscudoClase = 0.8

    Case "CAZADOR"
        ModEvasionDeEscudoClase = 0.6

    Case "PALADIN"
        ModEvasionDeEscudoClase = 0.9

    Case "ASESINO"
        ModEvasionDeEscudoClase = 1

    Case "LADRON"
        ModEvasionDeEscudoClase = 0.7

    Case "BANDIDO"
        ModEvasionDeEscudoClase = 0.6

    Case "PIRATA"
        ModEvasionDeEscudoClase = 0

    Case "CLERIGO"
        ModEvasionDeEscudoClase = 0.6

    Case "BARDO"
        ModEvasionDeEscudoClase = 0.8

    Case "DRUIDA"
        ModEvasionDeEscudoClase = 0.75

    Case "PESCADOR"
        ModEvasionDeEscudoClase = 0.5

    Case "LEÑADOR"
        ModEvasionDeEscudoClase = 0.5

    Case "MINERO"
        ModEvasionDeEscudoClase = 0.5

    Case "HERRERO"
        ModEvasionDeEscudoClase = 0.5

    Case "CARPINTERO"
        ModEvasionDeEscudoClase = 0.5

    Case "ERMITAÑO"
        ModEvasionDeEscudoClase = 0.5

    Case Else
        ModEvasionDeEscudoClase = 0.4

    End Select

    Exit Function
fallo:
    Call LogError("modificadorescudoclase " & Err.number & " D: " & Err.Description)

End Function

Public Function DañoEquipoMagico(ByVal Userindex As Integer) As Integer

'Dim obj As ObjData
'arma equipada
    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
        If ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).objetoespecial = 11 Then
            DañoEquipoMagico = DañoEquipoMagico + ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).Magia

        End If

    End If

    'sombrero equipado
    If UserList(Userindex).Invent.CascoEqpObjIndex > 0 Then
        If ObjData(UserList(Userindex).Invent.CascoEqpObjIndex).objetoespecial = 11 Then
            DañoEquipoMagico = DañoEquipoMagico + ObjData(UserList(Userindex).Invent.CascoEqpObjIndex).Magia

        End If

    End If

    'anillo equipado
    If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
        If ObjData(UserList(Userindex).Invent.AnilloEqpObjIndex).objetoespecial = 11 Then
            DañoEquipoMagico = DañoEquipoMagico + ObjData(UserList(Userindex).Invent.AnilloEqpObjIndex).Magia

        End If

    End If

End Function

Function Minimo(ByVal a As Single, ByVal b As Single) As Single

    On Error GoTo fallo

    If a > b Then
        Minimo = b
    Else: Minimo = a

    End If

    Exit Function
fallo:
    Call LogError("minimo " & Err.number & " D: " & Err.Description)

End Function

Function Maximo(ByVal a As Single, ByVal b As Single) As Single

    On Error GoTo fallo

    If a > b Then
        Maximo = a
    Else: Maximo = b

    End If

    Exit Function
fallo:
    Call LogError("maximo " & Err.number & " D: " & Err.Description)

End Function

Function PoderEvasionEscudo(ByVal Userindex As Integer) As Long

    On Error GoTo fallo

    Dim bcc As Integer

    'pluto:7.0 añado bonus enano
    If UserList(Userindex).raza = "Enano" Then bcc = 0 Else bcc = 0

    'pluto:7.0
    PoderEvasionEscudo = ((CInt(UserList(Userindex).Stats.UserSkills(Defensa) / 2) * (ModEvasionDeEscudoClase( _
                                                                                      UserList(Userindex).clase) + bcc)) / 2) + (ModEvasionDeEscudoClase(UserList(Userindex).clase) + bcc) * 10
    'PoderEvasionEscudo = (CInt(UserList(UserIndex).Stats.UserSkills(Defensa) / 2) * _
     ModEvasionDeEscudoClase(UserList(UserIndex).clase)) / 2
    PoderEvasionEscudo = PoderEvasionEscudo + Porcentaje(PoderEvasionEscudo, UserList(Userindex).UserDefensaEscudos)
    Exit Function
fallo:
    Call LogError("poderevasionescudo " & Err.number & " D: " & Err.Description)

End Function

Function PoderEvasion(ByVal Userindex As Integer, ByVal Tactico As Byte) As Long

    On Error GoTo fallo

    Dim PoderEvasionTemp As Long
    Dim bcc As Integer

    'pluto:7.0 añado bonus elfo oscuro
    If UserList(Userindex).raza = "Gnomo" Then
        bcc = 0.1
    
    ElseIf UserList(Userindex).raza = "Elfo Oscuro" Then
        bcc = 0.03
    
    Else
        bcc = 0
    
    End If

    Dim n As Double
    n = UserList(Userindex).Stats.UserSkills(Tactico) / 66
    PoderEvasionTemp = (UserList(Userindex).Stats.UserAtributos(Agilidad) * (ModificadorEvasion(UserList( _
                                                                                                Userindex).clase) + bcc)) + ((CInt(UserList(Userindex).Stats.UserSkills(Tactico) / 2) + (n * UserList( _
                                                                                                                                                                                         Userindex).Stats.UserAtributos(Agilidad))) * (ModificadorEvasion(UserList(Userindex).clase) + bcc))
    'Debug.Print PoderEvasionTemp

    'If UserList(UserIndex).Stats.UserSkills(Tactico) < 61 Then
    '   PoderEvasionTemp = (CInt(UserList(UserIndex).Stats.UserSkills(Tactico) / 2) * _
        '  ModificadorEvasion(UserList(UserIndex).clase))
    'ElseIf UserList(UserIndex).Stats.UserSkills(Tactico) < 121 Then
    '       PoderEvasionTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Tactico) / 2) + _
            '  UserList(UserIndex).Stats.UserAtributos(Agilidad)) * _
            ' ModificadorEvasion(UserList(UserIndex).clase))
    'ElseIf UserList(UserIndex).Stats.UserSkills(Tactico) < 181 Then
    ' PoderEvasionTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Tactico) / 2) + _
      ' (2 * UserList(UserIndex).Stats.UserAtributos(Agilidad))) * _
      ' ModificadorEvasion(UserList(UserIndex).clase))
    'Else
    '  PoderEvasionTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Tactico) / 2) + _
       ' (3 * UserList(UserIndex).Stats.UserAtributos(Agilidad))) * _
       '  ModificadorEvasion(UserList(UserIndex).clase))
    'End If

    PoderEvasion = (PoderEvasionTemp + (2.5 * Maximo(UserList(Userindex).Stats.ELV - 12, 0)))
    'evasion extra
    PoderEvasion = PoderEvasion + CInt(Porcentaje(PoderEvasion, UserList(Userindex).UserEvasiónRaza))

    'pluto:2.4 extra monturas
    If UserList(Userindex).flags.Montura = 1 Then
        Dim oo As Integer
        oo = UserList(Userindex).flags.ClaseMontura
        PoderEvasion = PoderEvasion + CInt(Porcentaje(PoderEvasion, UserList(Userindex).Montura.Evasion(oo)))

    End If

    '------------fin pluto:2.4-------------------

    Exit Function
fallo:
    Call LogError("poderevasion " & Err.number & " D: " & Err.Description)

End Function

Public Function PoderDañoProyectiles(ByVal Userindex As Integer, Optional ByVal NpcIndex As Integer = 0) As Long

    On Error GoTo fallo

    Dim DañoArma As Long, DañoUsuario As Long, Arma As ObjData, ModifClase As Single
    Dim proyectil As ObjData
    Dim DañoMaxArma As Long

    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
        Arma = ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex)

        If Arma.Municion = 1 Then    'arco equipado
            If UserList(Userindex).Invent.MunicionEqpObjIndex > 0 Then
                proyectil = ObjData(UserList(Userindex).Invent.MunicionEqpObjIndex)
                DañoArma = Arma.MaxHIT
                DañoMaxArma = Arma.MaxHIT
            Else
                DañoArma = Arma.MaxHIT
                DañoMaxArma = Arma.MaxHIT
                proyectil.MaxHIT = 1

            End If

        Else    'no arco equipado
            proyectil.MaxHIT = 1
            DañoArma = 3
            DañoMaxArma = 3

        End If

    Else    'no arma equipada
        DañoArma = 3
        DañoMaxArma = 3
        proyectil.MaxHIT = 1

    End If

    ModifClase = ModicadorDañoClaseProyectiles(UserList(Userindex).clase)
    DañoArma = DañoArma + proyectil.MaxHIT
    DañoUsuario = UserList(Userindex).Stats.MaxHIT
    PoderDañoProyectiles = (3 * DañoArma) + ((DañoMaxArma / 5) * (UserList(Userindex).Stats.UserAtributos(Fuerza) - _
                                                                  15) + DañoUsuario) * ModifClase

    PoderDañoProyectiles = PoderDañoProyectiles + CInt(Porcentaje(PoderDañoProyectiles, UserList( _
                                                                                        Userindex).UserDañoProyetilesRaza))

    If UserList(Userindex).GranPoder > 0 Then PoderDañoProyectiles = CInt(PoderDañoProyectiles * 1.4)
    

    If UserList(Userindex).flags.Montura = 1 Then
        Dim oo As Integer
        Dim nivk As Integer
        oo = UserList(Userindex).flags.ClaseMontura
        PoderDañoProyectiles = PoderDañoProyectiles + CInt(Porcentaje(PoderDañoProyectiles, UserList( _
                                                                                            Userindex).Montura.AtFlechas(oo))) + 1

    End If

    If PoderDañoProyectiles < 1 Then PoderDañoProyectiles = 1
    Exit Function
fallo:
    Call LogError("PoderdañoProyectiles " & Err.number & " D: " & Err.Description)

End Function

Public Function PoderResistenciaMagias(ByVal Userindex As Integer, _
                                       Optional ByVal NpcIndex As Integer = 0) As Long
    Dim daño As Byte
    daño = 20

    If UserList(Userindex).flags.Montura = 1 Then
        Dim nivk As Integer
        Dim oo As Byte
        oo = UserList(Userindex).flags.ClaseMontura
        nivk = UserList(Userindex).Montura.Nivel(oo)
        daño = daño + CInt(Porcentaje(daño, UserList(Userindex).Montura.DefMagico(oo))) + 1

    End If

    If UserList(Userindex).flags.Angel > 0 Then daño = CInt(daño + (daño * 0.5))
    If UserList(Userindex).flags.Protec > 0 Then daño = daño + CInt(Porcentaje(daño, UserList(Userindex).flags.Protec))

    'pluto:7.0
    If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
        daño = daño + ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex).Defmagica

    End If

    Dim obj As ObjData

    If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
        If ObjData(UserList(Userindex).Invent.AnilloEqpObjIndex).SubTipo = 4 Then daño = daño + CInt(daño / 30)

    End If

    daño = CInt(daño * ModMagia(UserList(Userindex).clase))
    daño = daño + CInt(Porcentaje(daño, UserList(Userindex).UserDefensaMagiasRaza))
    PoderResistenciaMagias = daño

End Function

Public Function PoderDañoMagias(ByVal Userindex As Integer, Optional ByVal NpcIndex As Integer = 0) As Long
    Dim daño As Integer
    Dim Topito As Long

    'cero para los sin mana
    If UserList(Userindex).Stats.MaxMAN = 0 Then
        PoderDañoMagias = 0
        Exit Function

    End If

    daño = 20

    'monturas
    If UserList(Userindex).flags.Montura = 1 Then
        Dim pl As Integer
        Dim po As Integer
        Dim nivk As Byte
        Dim kk As Byte
        po = UserList(Userindex).flags.ClaseMontura
        nivk = UserList(Userindex).Montura.Nivel(po)
        daño = daño + CInt(Porcentaje(daño, UserList(Userindex).Montura.AtMagico(po))) + 1

        'If UserList(UserIndex).Montura.AtMagico(po) > 0 Then pl = UserList(UserIndex).Montura.Golpe(po) Else pl = 0
        'If UserList(UserIndex).Montura.Tipo(po) = 6 Then pl = UserList(UserIndex).Montura.Golpe(po)
    End If

    If UserList(Userindex).Remort = 0 Then
        daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)
    Else

        If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
            ' Dim Topito As Long
            Topito = UserList(Userindex).Stats.ELV * 3.65

            If UserList(Userindex).Stats.ELV > 45 Then Topito = 45 * 3.65
            daño = daño + Porcentaje(daño, Topito)
        Else
            daño = daño + Porcentaje(daño, 3 * UserList(Userindex).Stats.ELV)

        End If

    End If

    'gran poder
    If UserList(Userindex).GranPoder > 0 Then daño = daño * 1.4

    'añadimos % de equipo
    'nati: cambio esto, ya no será por porcentaje.
    'daño = daño + CInt(Porcentaje(daño, DañoEquipoMagico(UserIndex)))
    daño = daño + DañoEquipoMagico(Userindex)

    'If UserList(UserIndex).Invent.WeaponEqpObjIndex > 0 Then
    'pluto:7.0 MENOS DAÑO SIN VARA
    'If ObjData(UserList(UserIndex).Invent.WeaponEqpObjIndex).SubTipo <> 13 Then
    'daño = daño - CInt(Porcentaje(daño, 10))
    'End If
    'Else
    'daño = daño - CInt(Porcentaje(daño, 10))
    'End If

    'pluto:7.0 lo muevo detras para dar mas importancia a los modificadores
    daño = CInt(daño * ModMagia(UserList(Userindex).clase))
    daño = daño + CInt(Porcentaje(daño, UserList(Userindex).UserDañoMagiasRaza))
    PoderDañoMagias = daño

End Function

Public Function PoderDefensaFisica(ByVal Userindex As Integer, _
                                   Optional ByVal NpcIndex As Integer = 0) As Long
    Dim daño As Integer
    Dim defbarco As Integer
    Dim obj As ObjData
    Dim absorbido As Integer
    daño = 20

    'angel
    If UserList(Userindex).flags.Angel > 0 Then daño = CInt(daño + (daño * 0.5))

    'montura
    If UserList(Userindex).flags.Montura = 1 Then
        Dim oo As Integer
        oo = UserList(Userindex).flags.ClaseMontura
        daño = daño + CInt(Porcentaje(daño, UserList(Userindex).Montura.Defcuerpo(oo))) + 1

    End If

    'barcas
    If UserList(Userindex).flags.Navegando = 1 Then
        obj = ObjData(UserList(Userindex).Invent.BarcoObjIndex)
        daño = daño + obj.MaxDef

    End If

    'objetos
    'Si tiene casco
    If UserList(Userindex).Invent.CascoEqpObjIndex > 0 Then
        obj = ObjData(UserList(Userindex).Invent.CascoEqpObjIndex)
        daño = daño + obj.MaxDef

    End If

    'Si tiene alas
    If UserList(Userindex).Invent.AlaEqpObjIndex > 0 Then
        obj = ObjData(UserList(Userindex).Invent.AlaEqpObjIndex)
        daño = daño + obj.MaxDef

    End If

    'Si tiene botas
    If UserList(Userindex).Invent.BotaEqpObjIndex > 0 Then
        obj = ObjData(UserList(Userindex).Invent.BotaEqpObjIndex)
        daño = daño + obj.MaxDef

    End If

    'Si tiene escudo
    If UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then
        obj = ObjData(UserList(Userindex).Invent.EscudoEqpObjIndex)
        daño = daño + obj.MaxDef

    End If

    'Si tiene armadura
    If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
        obj = ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex)
        daño = daño + obj.MaxDef

    End If

    PoderDefensaFisica = daño

End Function

Public Function PoderDañoArma(ByVal Userindex As Integer, Optional ByVal NpcIndex As Integer = 0) As Long

    On Error GoTo fallo

    Dim DañoArma As Long, DañoUsuario As Long, Arma As ObjData, ModifClase As Single
    Dim proyectil As ObjData
    Dim DañoMaxArma As Long

    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
        Arma = ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex)

        If Left$(Arma.Name, 19) = "Espada MataDragones" Or Arma.Municion > 0 Then
            ModifClase = ModicadorDañoClaseArmas(UserList(Userindex).clase)
            DañoArma = 3    ' Si usa la espada matadragones daño es 1
            DañoMaxArma = 3
        Else

            ModifClase = ModicadorDañoClaseArmas(UserList(Userindex).clase)
            DañoArma = Arma.MaxHIT
            DañoMaxArma = Arma.MaxHIT

        End If

    Else    'sin arma
        DañoArma = 3
        DañoMaxArma = 3
        ModifClase = ModicadorDañoClaseArmas(UserList(Userindex).clase)

    End If

    'pluto:2.15 ----- Daño Estandartes Armadas ----------
    If Arma.SubTipo = 5 Then
        DañoArma = 1
        DañoMaxArma = 1

    End If

    'End If
    '---------------------------------------------------
    DañoUsuario = UserList(Userindex).Stats.MaxHIT
    PoderDañoArma = (3 * DañoArma) + ((DañoMaxArma / 5) * (UserList(Userindex).Stats.UserAtributos(Fuerza) - 15) + _
                                      DañoUsuario) * ModifClase

    PoderDañoArma = PoderDañoArma + CInt(Porcentaje(PoderDañoArma, UserList(Userindex).UserDañoArmasRaza))

    'pluto:2.11
    If UserList(Userindex).GranPoder > 0 Then PoderDañoArma = CInt(PoderDañoArma * 1.4)

    'pluto:2.4 extra monturas
    If UserList(Userindex).flags.Montura = 1 Then
        Dim oo As Integer
        Dim nivk As Integer
        oo = UserList(Userindex).flags.ClaseMontura
        PoderDañoArma = PoderDañoArma + CInt(Porcentaje(PoderDañoArma, UserList(Userindex).Montura.AtCuerpo(oo))) + 1

    End If

    '------------fin pluto:2.4-------------------
    'pluto:2.8.0
    If PoderDañoArma < 1 Then PoderDañoArma = 1
    Exit Function
fallo:
    Call LogError("poderdañoarma " & Err.number & " D: " & Err.Description)

End Function

Function PoderAtaqueArma(ByVal Userindex As Integer) As Long

    On Error GoTo fallo

    Dim PoderAtaqueTemp As Long
    Dim bcc As Integer

    'pluto:7.0 añado bonus gnomo
    If UserList(Userindex).raza = "Gnomo" Then
        bcc = 0
        'se agrego if para daño de orcos
    ElseIf UserList(Userindex).raza = "Orco" Then
        bcc = 0
    Else
        bcc = 0

    End If

    'pluto:7.0 Nueva fórmula
    Dim n As Double
    n = UserList(Userindex).Stats.UserSkills(Armas) / 66
    PoderAtaqueTemp = (UserList(Userindex).Stats.UserAtributos(Agilidad) * (ModificadorPoderAtaqueArmas(UserList( _
                                                                                                        Userindex).clase) + bcc)) + ((CInt(UserList(Userindex).Stats.UserSkills(Armas) / 2) + (n * UserList( _
                                                                                                                                                                                               Userindex).Stats.UserAtributos(Agilidad))) * (ModificadorPoderAtaqueArmas(UserList(Userindex).clase) + _
                                                                                                                                                                                                                                             bcc))

    'If UserList(UserIndex).Stats.UserSkills(Armas) < 61 Then
    '   PoderAtaqueTemp = (CInt(UserList(UserIndex).Stats.UserSkills(Armas) / 2) * _
        '  ModificadorPoderAtaqueArmas(UserList(UserIndex).clase))
    'ElseIf UserList(UserIndex).Stats.UserSkills(Armas) < 121 Then
    '   PoderAtaqueTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Armas) / 2) + _
        '  UserList(UserIndex).Stats.UserAtributos(Agilidad)) * _
        ' ModificadorPoderAtaqueArmas(UserList(UserIndex).clase))
    'ElseIf UserList(UserIndex).Stats.UserSkills(Armas) < 181 Then
    '   PoderAtaqueTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Armas) / 2) + _
        '  (2 * UserList(UserIndex).Stats.UserAtributos(Agilidad))) * _
        ' ModificadorPoderAtaqueArmas(UserList(UserIndex).clase))
    'Else
    '  PoderAtaqueTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Armas) / 2) + _
       ' (3 * UserList(UserIndex).Stats.UserAtributos(Agilidad))) * _
       'ModificadorPoderAtaqueArmas(UserList(UserIndex).clase))
    'End If

    PoderAtaqueArma = (PoderAtaqueTemp + (2.5 * Maximo(UserList(Userindex).Stats.ELV - 12, 0)))

    'pluto:
    If UserList(Userindex).Remort > 0 Then PoderAtaqueArma = PoderAtaqueArma + CInt(PoderAtaqueArma / 3)
    Exit Function
fallo:
    Call LogError("poderataquearma " & Err.number & " D: " & Err.Description)

End Function

Function PoderAtaqueProyectil(ByVal Userindex As Integer) As Long

    On Error GoTo fallo

    Dim PoderAtaqueTemp As Long
    'pluto:7.0 Nueva fórmula
    Dim n As Double
    n = UserList(Userindex).Stats.UserSkills(Proyectiles) / 66
    PoderAtaqueTemp = (UserList(Userindex).Stats.UserAtributos(Agilidad) * ModificadorPoderAtaqueProyectiles(UserList( _
                                                                                                             Userindex).clase)) + ((CInt(UserList(Userindex).Stats.UserSkills(Proyectiles) / 2) + (n * UserList( _
                                                                                                                                                                                                   Userindex).Stats.UserAtributos(Agilidad))) * ModificadorPoderAtaqueProyectiles(UserList(Userindex).clase))

    'If UserList(UserIndex).Stats.UserSkills(Proyectiles) < 61 Then
    '   PoderAtaqueTemp = (CInt(UserList(UserIndex).Stats.UserSkills(Proyectiles) / 2) * _
        '  ModificadorPoderAtaqueProyectiles(UserList(UserIndex).clase))
    'ElseIf UserList(UserIndex).Stats.UserSkills(Proyectiles) < 121 Then
    '       PoderAtaqueTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Proyectiles) / 2) + _
            '      UserList(UserIndex).Stats.UserAtributos(Agilidad)) * _
            '     ModificadorPoderAtaqueProyectiles(UserList(UserIndex).clase))
    'ElseIf UserList(UserIndex).Stats.UserSkills(Proyectiles) < 181 Then
    '       PoderAtaqueTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Proyectiles) / 2) + _
            '      (2 * UserList(UserIndex).Stats.UserAtributos(Agilidad))) * _
            '     ModificadorPoderAtaqueProyectiles(UserList(UserIndex).clase))
    'Else
    '      PoderAtaqueTemp = ((CInt(UserList(UserIndex).Stats.UserSkills(Proyectiles) / 2) + _
           '    (3 * UserList(UserIndex).Stats.UserAtributos(Agilidad))) * _
           '   ModificadorPoderAtaqueProyectiles(UserList(UserIndex).clase))
    'End If

    PoderAtaqueProyectil = (PoderAtaqueTemp + (2.5 * Maximo(UserList(Userindex).Stats.ELV - 12, 0)))

    'pluto:
    If UserList(Userindex).Remort > 0 Then PoderAtaqueProyectil = PoderAtaqueProyectil + CInt(PoderAtaqueProyectil / 3)
    Exit Function
fallo:
    Call LogError("poderataqueproyectil " & Err.number & " D: " & Err.Description)

End Function

Public Function UserImpactoNpc(ByVal Userindex As Integer, _
                               ByVal NpcIndex As Integer) As Boolean

    On Error GoTo fallo

    Dim PoderAtaque As Long
    Dim Arma As Integer
    Dim proyectil As Boolean
    Dim ProbExito As Long

    Arma = UserList(Userindex).Invent.WeaponEqpObjIndex

    If Arma = 0 Then proyectil = False Else proyectil = ObjData(Arma).proyectil = 1

    If Arma > 0 Then    'Usando un arma
        If proyectil Then
            PoderAtaque = PoderAtaqueProyectil(Userindex)
        Else
            PoderAtaque = PoderAtaqueArma(Userindex)

        End If

        'Else 'Peleando con puños
        'PoderAtaque = PoderAtaqueWresterling(UserIndex)
    End If

    ProbExito = Maximo(10, Minimo(90, 50 + ((PoderAtaque - Npclist(NpcIndex).PoderEvasion) * 0.4)))
    'pluto:2.17 ettin y puerta menos daño flechas
    'If (Npclist(NpcIndex).NPCtype = 77 Or Npclist(NpcIndex).NPCtype = 78) And proyectil = True Then ProbExito = 5
    'pluto:2.17 rey y puerta menos daño arma
    'If (Npclist(NpcIndex).NPCtype = 33 Or Npclist(NpcIndex).NPCtype = 78) And proyectil = False Then ProbExito = 5

    'pluto:6.0A menos acierto flechas rey, puerta y ettin
    If (Npclist(NpcIndex).NPCtype = 77 Or Npclist(NpcIndex).NPCtype = 78 Or Npclist(NpcIndex).NPCtype = 33) And _
       proyectil = True Then ProbExito = ProbExito - 40

    UserImpactoNpc = (RandomNumber(1, 100) <= ProbExito)

    If UserImpactoNpc Then
        If Arma <> 0 Then

            'pluto:2.17
            Dim nPos As WorldPos

            If Npclist(NpcIndex).NPCtype = 78 Then

                nPos.Map = Npclist(NpcIndex).Pos.Map
                nPos.X = Npclist(NpcIndex).Pos.X
                nPos.Y = Npclist(NpcIndex).Pos.Y

                Select Case Npclist(NpcIndex).Stats.MinHP

                Case 10000 To 15000
                    Npclist(NpcIndex).Char.Body = 360

                Case 5000 To 9999
                    Npclist(NpcIndex).Char.Body = 361

                Case 1 To 4999
                    Npclist(NpcIndex).Char.Body = 362

                End Select

                Call ChangeNPCChar(ToMap, 0, nPos.Map, NpcIndex, Npclist(NpcIndex).Char.Body, 0, 1, 1)

            End If

            '--------------------------------------------

            If proyectil Then
                Call SubirSkill(Userindex, Proyectiles)
            Else
                Call SubirSkill(Userindex, Armas)

            End If

        Else

            ' Call SubirSkill(UserIndex, Wresterling)
        End If

    End If

    Exit Function
fallo:
    Call LogError("userimpactonpc " & Err.number & " D: " & Err.Description)

End Function

Public Function NpcImpacto(ByVal NpcIndex As Integer, _
                           ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    Dim Rechazo As Boolean
    Dim ProbRechazo As Long
    Dim ProbExito As Long
    Dim UserEvasion As Long
    Dim NpcPoderAtaque As Long
    Dim PoderEvasioEscudo As Long
    Dim Skilltactico As Long
    Dim SkillDefensa As Long

    UserEvasion = PoderEvasion(Userindex, Tacticas)
    NpcPoderAtaque = Npclist(NpcIndex).PoderAtaque

    Skilltactico = CInt(UserList(Userindex).Stats.UserSkills(Tacticas) / 2)
    SkillDefensa = CInt(UserList(Userindex).Stats.UserSkills(Defensa) / 2)

    'Esta usando un escudo ???
    If UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then

        PoderEvasioEscudo = PoderEvasionEscudo(Userindex)
        UserEvasion = UserEvasion + PoderEvasioEscudo

    End If

    ProbExito = Maximo(10, Minimo(90, 50 + ((NpcPoderAtaque - UserEvasion) * 0.4)))

    NpcImpacto = (RandomNumber(1, 100) <= ProbExito)

    ' el usuario esta usando un escudo ???
    If UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then
        If NpcImpacto = False Then
            If SkillDefensa = 0 Then SkillDefensa = 1
            If Skilltactico = 0 Then Skilltactico = 1
            ProbRechazo = Maximo(10, Minimo(90, 100 * (SkillDefensa / (SkillDefensa + Skilltactico))))

            Rechazo = (RandomNumber(1, 100) <= ProbRechazo)

            If Rechazo = True Then
                'Se rechazo el ataque con el escudo
                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_ESCUDO)
                Call SendData(ToIndex, Userindex, 0, "7")
                Call SubirSkill(Userindex, Defensa)

            End If

        End If

    End If

    Exit Function
fallo:
    Call LogError("npcimpacto " & Err.number & " D: " & Err.Description)

End Function

Public Function CalcularDaño(ByVal Userindex As Integer, Optional ByVal NpcIndex As Integer = 0) As Long

    On Error GoTo fallo

    Dim DañoArma As Long, DañoUsuario As Long, Arma As ObjData, ModifClase As Single
    Dim proyectil As ObjData
    Dim DañoMaxArma As Long

    If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
        Arma = ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex)

        ' Ataca a un npc?
        If NpcIndex > 0 Then

            'Usa la mata dragones?
            If Left$(Arma.Name, 19) = "Espada MataDragones" Then    ' Usa la matadragones?
                ModifClase = ModicadorDañoClaseArmas(UserList(Userindex).clase)

                If Npclist(NpcIndex).NPCtype = DRAGON Then    'Ataca dragon?
                    DañoArma = RandomNumber(Arma.MinHIT, Arma.MaxHIT)
                    DañoMaxArma = Arma.MaxHIT
                Else    ' Sino es dragon daño es 1
                    DañoArma = 1
                    DañoMaxArma = 1

                End If

            Else    ' daño comun

                If Arma.proyectil = 1 Then
                    ModifClase = ModicadorDañoClaseProyectiles(UserList(Userindex).clase)

                    DañoArma = RandomNumber(Arma.MinHIT, Arma.MaxHIT)
                    DañoMaxArma = Arma.MaxHIT

                    If Arma.Municion = 1 Then
                        proyectil = ObjData(UserList(Userindex).Invent.MunicionEqpObjIndex)
                        DañoArma = DañoArma + RandomNumber(proyectil.MinHIT, proyectil.MaxHIT)
                        DañoMaxArma = Arma.MaxHIT

                    End If

                Else

                    ModifClase = ModicadorDañoClaseArmas(UserList(Userindex).clase)
                    DañoArma = RandomNumber(Arma.MinHIT, Arma.MaxHIT)
                    DañoMaxArma = Arma.MaxHIT

                End If

            End If

        Else    ' Ataca usuario

            If Left$(Arma.Name, 19) = "Espada MataDragones" Then
                ModifClase = ModicadorDañoClaseArmas(UserList(Userindex).clase)
                DañoArma = 1    ' Si usa la espada matadragones daño es 1
                DañoMaxArma = 1
            Else

                If Arma.proyectil = 1 Then
                    ModifClase = ModicadorDañoClaseProyectiles(UserList(Userindex).clase)
                    DañoArma = RandomNumber(Arma.MinHIT, Arma.MaxHIT)
                    DañoMaxArma = Arma.MaxHIT

                    If Arma.Municion = 1 Then
                        proyectil = ObjData(UserList(Userindex).Invent.MunicionEqpObjIndex)
                        DañoArma = DañoArma + RandomNumber(proyectil.MinHIT, proyectil.MaxHIT)
                        DañoMaxArma = Arma.MaxHIT

                    End If

                Else
                    ModifClase = ModicadorDañoClaseArmas(UserList(Userindex).clase)
                    DañoArma = RandomNumber(Arma.MinHIT, Arma.MaxHIT)
                    DañoMaxArma = Arma.MaxHIT

                End If

            End If

        End If

    End If

    'pluto:2.15 ----- Daño Estandartes Armadas ----------
    If Arma.SubTipo = 5 Then
        If NpcIndex > 0 Then
            If Npclist(NpcIndex).NPCtype = 79 Then
                DañoArma = RandomNumber(Arma.MinHIT, Arma.MaxHIT) * 5
                DañoMaxArma = Arma.MaxHIT * 5
            Else
                DañoArma = 1
                DañoMaxArma = 1

            End If

        Else    'usuario
            DañoArma = 1
            DañoMaxArma = 1

        End If

    End If

    '---------------------------------------------------
    DañoUsuario = RandomNumber(UserList(Userindex).Stats.MinHIT, UserList(Userindex).Stats.MaxHIT)
    CalcularDaño = (3 * DañoArma) + ((DañoMaxArma / 5) * (UserList(Userindex).Stats.UserAtributos(Fuerza) - 15) + _
                                     DañoUsuario) * ModifClase
    'daño extra raza

    'If UserList(UserIndex).raza = "Orco" And Arma.proyectil <> 1 Then CalcularDaño = CalcularDaño + CInt(CalcularDaño / 5)
    'If UserList(UserIndex).raza = "Humano" And Arma.proyectil <> 1 Then CalcularDaño = CalcularDaño + CInt(CalcularDaño / 10)
    'If UserList(UserIndex).raza = "Enano" And Arma.proyectil <> 1 Then CalcularDaño = CalcularDaño + CInt(CalcularDaño / 10)

    'If UserList(UserIndex).raza = "Elfo" And Arma.proyectil = 1 Then CalcularDaño = CalcularDaño + CInt(CalcularDaño / 5)
    'If UserList(UserIndex).raza = "Elfo Oscuro" And Arma.proyectil = 1 Then CalcularDaño = CalcularDaño + CInt(Porcentaje(CalcularDaño, 15))

    'pluto:2.17 skills
    If Arma.proyectil > 0 Then
        'pluto:2.18---------
        CalcularDaño = CalcularDaño + CInt(Porcentaje(CalcularDaño, UserList(Userindex).UserDañoProyetilesRaza))
        '-------------------
        'pluto:6.0A
        'CalcularDaño = CalcularDaño + CInt(Porcentaje(CalcularDaño, CInt(UserList(UserIndex).Stats.UserSkills(DañoProyec) / 10)))
        'Call SubirSkill(UserIndex, DañoProyec)
        '--------------------------
        Call SubirSkill(Userindex, RequeProyec)
    Else
        'pluto:2.18---------
        CalcularDaño = CalcularDaño + CInt(Porcentaje(CalcularDaño, UserList(Userindex).UserDañoArmasRaza))
        '-------------------
        'pluto:6.0A
        'CalcularDaño = CalcularDaño + CInt(Porcentaje(CalcularDaño, CInt(UserList(UserIndex).Stats.UserSkills(DanoArma) / 10)))
        'Call SubirSkill(UserIndex, DanoArma)
        '--------------------
        Call SubirSkill(Userindex, RequeArma)

    End If

    '------------------------

    'pluto:2.11
    If UserList(Userindex).GranPoder > 0 Then CalcularDaño = CInt(CalcularDaño * 1.4)

    'pluto:2.4 extra monturas
    If UserList(Userindex).flags.Montura = 1 Then
        'Dim kk As Integer
        Dim oo As Integer
        Dim nivk As Integer
        oo = UserList(Userindex).flags.ClaseMontura

        'kk = 0
        'If oo = 2 Then kk = 2
        'If oo = 3 Then kk = 3
        'If oo = 4 Then kk = 4
        'If oo = 5 Then kk = 3
        'nivk = UserList(Userindex).Montura.Nivel(oo)
        'pluto:6.0A
        If Arma.proyectil > 0 Then
            CalcularDaño = CalcularDaño + CInt(Porcentaje(CalcularDaño, UserList(Userindex).Montura.AtFlechas(oo))) + 1
        Else
            CalcularDaño = CalcularDaño + CInt(Porcentaje(CalcularDaño, UserList(Userindex).Montura.AtCuerpo(oo))) + 1

        End If

    End If

    '------------fin pluto:2.4-------------------
    'pluto:2.8.0
    If CalcularDaño < 1 Then CalcularDaño = 1
    Exit Function
fallo:
    Call LogError("calculardaño " & Err.number & " D: " & Err.Description)

End Function

Public Sub UserDañoNpc(ByVal Userindex As Integer, ByVal NpcIndex As Integer)

    On Error GoTo fallo

    Dim Loco As Integer
    Dim daño As Long
    Dim Critico As Integer
    Dim Criti As Byte
    Dim LogroOro As Boolean

    daño = CalcularDaño(Userindex, NpcIndex)

    'esta navegando? si es asi le sumamos el daño del barco
    If UserList(Userindex).flags.Navegando = 1 Then
        daño = daño + RandomNumber(ObjData(UserList(Userindex).Invent.BarcoObjIndex).MinHIT, ObjData(UserList( _
                                                                                                     Userindex).Invent.BarcoObjIndex).MaxHIT)

    End If

    '----------------------------------------------------
    daño = daño - Npclist(NpcIndex).Stats.Def

    'pluto:7.0 añado logro plata y oro-------------------------
    'LogroOro = False
    If Npclist(NpcIndex).LogroTipo > 0 Then

        Select Case UserList(Userindex).Stats.PremioNPC(Npclist(NpcIndex).LogroTipo)

        Case 25 To 249
            daño = daño + Porcentaje(daño, 5)

        Case Is > 249
            daño = daño + Porcentaje(daño, 15)

        Case Is > 449
            LogroOro = True

        End Select

    End If

    '-----------------------------------------------------------

    'pluto:2.9.0
    If Npclist(NpcIndex).NPCtype = 60 And daño > 0 Then daño = CInt(daño / 2)

    'pluto:2.3
    'quitar esto
    If UserList(Userindex).flags.Privilegios > 0 Then daño = 0

    If daño < 0 Then daño = 0

    'If UserList(UserIndex).Char.Heading = Npclist(NpcIndex).Char.Heading Then daño = daño * 2
    Loco = 1
    'EZE BERSERKER
    Dim Lele As Integer
    Lele = UserList(Userindex).Stats.MaxHP / 3



    If UserList(Userindex).Stats.MinHP < Lele And UserList(Userindex).raza = "Enano" Then

        daño = daño * 1.5

    End If
    
    If UserList(Userindex).raza = "Elfo Oscuro" Then
    daño = daño + CInt(Porcentaje(daño, 2))
    End If


    'pluto:7.0 Criticos de ciclopes
    If UserList(Userindex).raza = "Licantropos" Then
        Dim probi As Integer
        probi = RandomNumber(1, 100) + CInt((UserList(Userindex).Stats.UserSkills(suerte) / 40))

        If probi > 95 Then
            Criti = 6
            GoTo ciclo

        End If

    End If

    'pluto:6.0A-----golpes criticos-------------
    'pluto:7.0
    If Npclist(NpcIndex).GiveEXP < 37000 Or LogroOro = True Then
        Dim cf As Integer
        cf = 3500

        If ObjData(UserList(Userindex).Invent.WeaponEqpObjIndex).proyectil > 0 Then cf = cf + 2000
        'pluto:6.5----------------
        'Loco = RandomNumber(1, cf)
        'If Loco < (UserList(UserIndex).Stats.UserSkills(suerte) * 5) Then Loco = (UserList(UserIndex).Stats.UserSkills(suerte) * 5)
        '-------------------------
        Loco = 2
        Critico = RandomNumber(1, cf) - (UserList(Userindex).Stats.UserSkills(suerte) * 5)

        If Critico < 60 Then Criti = 2
        If Critico > 59 And Critico < 109 Then Criti = 3
        If Critico > 108 And Critico < 118 Then Criti = 4
        If Critico > 117 And Critico < 120 Then Criti = 5
    Else
        Loco = 3
        'pluto:6.5-----------------
        'Loco = RandomNumber(1, cf + 7000)
        'If Loco < (UserList(UserIndex).Stats.UserSkills(suerte) * 10) Then Loco = (UserList(UserIndex).Stats.UserSkills(suerte) * 10)
        '-------------------------
        Critico = RandomNumber(1, cf + 7000) - (UserList(Userindex).Stats.UserSkills(suerte) * 10)

        If Critico < 60 Then Criti = 2
        If Critico > 59 And Critico < 109 Then Criti = 3
        If Critico > 108 And Critico < 118 Then Criti = 4

    End If

    '------------------------------------------------
    Loco = 4
ciclo:

    Debug.Print daño & " Antes"
    If UserList(Userindex).flags.SegCritico = True Then Criti = 1
    If Criti > 0 And Criti <> 5 Then daño = daño * Criti
    
    Debug.Print daño & " Despues"

    'pluto:6.2 mortales no en piñatas y raids
    If Criti = 5 And Npclist(NpcIndex).Raid = 0 And Npclist(NpcIndex).numero <> 664 Then Npclist( _
       NpcIndex).Stats.MinHP = 0

    Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MinHP - daño

    'pluto:2.4
    If UserList(Userindex).flags.Montura = 1 Then
        Loco = 5
        Dim pl As Integer
        Dim po As Integer
        Dim nivk As Integer
        'Dim kk As Byte
        'Dim nivk As Byte
        po = UserList(Userindex).flags.ClaseMontura
        'nivk = UserList(Userindex).Montura.Nivel(po)
        'pluto:6.0A
        pl = UserList(Userindex).Montura.Golpe(po)
        'pluto:2.11 --------------
        'If po = 2 Then kk = 2
        'If po = 3 Then kk = 3
        'If po = 4 Then kk = 4
        'If po = 5 Then kk = 3

        'daño = daño + CInt(Porcentaje(daño, nivk * PMascotas(po).AumentoCuerpo)) + 1

        'daño = daño + CInt(Porcentaje(daño, nivk * kk)) + 1
        '-------------------------

        Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MinHP - pl

    End If

    Loco = 6

    '----------fin pluto:2.4-----------------
    If Npclist(NpcIndex).Stats.MinHP < 0 Then Npclist(NpcIndex).Stats.MinHP = 0
    'pluto:2.19 añado criti
    Call SendData(ToIndex, Userindex, 0, "U2" & daño & "," & pl & "," & Npclist(NpcIndex).Char.CharIndex & "," & _
                                         Npclist(NpcIndex).Name & "," & Npclist(NpcIndex).Stats.MinHP & "," & Npclist(NpcIndex).Stats.MaxHP & "," _
                                         & Criti)
    'Call SendData(ToIndex, UserIndex, 0, "||" & Npclist(NpcIndex).Name & ": " & Npclist(NpcIndex).Stats.MinHP & "/" & Npclist(NpcIndex).Stats.MaxHP & FONTTYPENAMES.FONTTYPE_fight)

    'pluto:6.5
    'If Npclist(NpcIndex).Raid > 0 Then
    'Loco = 7
    'Dim recu As Integer
    'recu = RandomNumber(1, Npclist(NpcIndex).Raid * 20)
    '   If RandomNumber(1, 200) < Npclist(NpcIndex).Raid Then
    'Call AddtoVar(Npclist(NpcIndex).Stats.MinHP, recu, Npclist(NpcIndex).Stats.MaxHP)
    '   Else
    'recu = 0
    '   End If
    'Call SendData(toParty, UserIndex, UserList(UserIndex).Pos.Map, "H4" & Npclist(NpcIndex).Char.CharIndex & "," & Npclist(NpcIndex).Stats.MinHP & "," & recu)
    'End If

    'pluto:2.15
    Loco = 8

    If Npclist(NpcIndex).Stats.MinHP > 0 Then

        'Trata de dar segundo golpe
        If PuedeDobleArma(Userindex) Then
            Call DoDobleArma(Userindex, NpcIndex, 0, daño)
            Call SubirSkill(Userindex, DobleArma)

        End If

    End If

    '----------------

    If Npclist(NpcIndex).Stats.MinHP > 0 Then

        'Trata de apuñalar por la espalda al enemigo
        If PuedeApuñalar(Userindex) Then
            Call DoApuñalar(Userindex, NpcIndex, 0, daño)
            Call SubirSkill(Userindex, Apuñalar)

        End If

    End If

    Loco = 9

    'pluto: npc en la casa
    If (Npclist(NpcIndex).Pos.Map = 171 Or Npclist(NpcIndex).Pos.Map = 177) And (Npclist(NpcIndex).Stats.MinHP < _
                                                                                 Npclist(NpcIndex).Stats.MaxHP / 3) Then
        Loco = 10
        Dim Ale
        Ale = RandomNumber(1, 500)

        Select Case Ale

            'npc se quitaparalisis
        Case Is < 20

            If Npclist(NpcIndex).flags.Paralizado > 0 Then
                Npclist(NpcIndex).flags.Paralizado = 0
                Npclist(NpcIndex).Contadores.Paralisis = 0
                Call SendData(ToMap, 0, Npclist(NpcIndex).Pos.Map, "TW" & 115)
                Call SendData(ToIndex, Userindex, 0, "|| Los Espiritus de la casa han desparalizado al " & _
                                                     Npclist(NpcIndex).Name & "´" & FontTypeNames.FONTTYPE_talk)

            End If

            'npc se cura
        Case 21 To 30

            If Npclist(NpcIndex).Stats.MinHP < Npclist(NpcIndex).Stats.MaxHP Then
                Npclist(NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MaxHP
                Call SendData(ToMap, 0, Npclist(NpcIndex).Pos.Map, "TW" & 115)
                Call SendData2(ToPCArea, Userindex, Npclist(NpcIndex).Pos.Map, 22, Npclist( _
                                                                                   NpcIndex).Char.CharIndex & "," & Hechizos(32).FXgrh & "," & Hechizos(32).loops)
                Call SendData(ToIndex, Userindex, 0, "|| Los Espiritus de la casa han Sanado al " & Npclist( _
                                                     NpcIndex).Name & "´" & FontTypeNames.FONTTYPE_talk)

            End If

            'npc saca npcs
        Case 31 To 32
            Call SpawnNpc(550, UserList(Userindex).Pos, True, False)
            Call SendData(ToMap, 0, Npclist(NpcIndex).Pos.Map, "TW" & 115)
            Call SendData(ToIndex, Userindex, 0, "|| Los Espiritus invocan una ayuda al " & Npclist( _
                                                 NpcIndex).Name & "´" & FontTypeNames.FONTTYPE_talk)

        End Select

    End If

    'pluto:2.17
    If Npclist(NpcIndex).NPCtype = 78 Then
        If Npclist(NpcIndex).Stats.MinHP < 15000 Then Npclist(NpcIndex).Char.Body = 360
        If Npclist(NpcIndex).Stats.MinHP < 10000 Then Npclist(NpcIndex).Char.Body = 361
        If Npclist(NpcIndex).Stats.MinHP < 5000 Then Npclist(NpcIndex).Char.Body = 362

    End If

    'pluto:6.5--------------------------------------------------------------------------
    If Npclist(NpcIndex).Raid > 0 Then
        Dim nn As Byte
        Dim MinPc As npc
        MinPc = Npclist(NpcIndex)
        Dim Porvida As Integer
        Porvida = Int((Npclist(NpcIndex).Stats.MinHP * 100) / Npclist(NpcIndex).Stats.MaxHP)

        Select Case Porvida

        Case Is < 10

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 1 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 0

            End If

        Case Is < 20

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 2 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 1

            End If

        Case Is < 30

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 3 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 2

            End If

        Case Is < 40

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 4 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 3

            End If

        Case Is < 50

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 5 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 4

            End If

        Case Is < 60

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 6 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 5

            End If

        Case Is < 70

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 7 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 6

            End If

        Case Is < 80

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 8 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 7

            End If

        Case Is < 90

            If RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 9 Then

                For nn = 1 To 5

                    If RandomNumber(1, 100) > 20 Then Call SpawnNpc(MinPc.numero + 6, MinPc.Pos, True, False)
                Next
                RaidVivos(Npclist(NpcIndex).numero - 699).MiniRaids = 8

            End If

        End Select

    End If

    '---------------------------------------------------------------------------------

    If Npclist(NpcIndex).Stats.MinHP <= 0 Then
        If Npclist(NpcIndex).Name = "Rey del Castillo" Or Npclist(NpcIndex).Name = "Defensor Fortaleza" Then Npclist( _
           NpcIndex).Stats.MinHP = Npclist(NpcIndex).Stats.MaxHP

        ' Si era un Dragon perdemos la espada matadragones
        If Npclist(NpcIndex).NPCtype = DRAGON Then
            If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then

                'pluto:2.12
                If UserList(Userindex).Invent.WeaponEqpObjIndex = 402 Then
                    Call Desequipar(Userindex, UserList(Userindex).Invent.WeaponEqpSlot)
                    Call QuitarObjetos(402, 1, Userindex)
                    UserList(Userindex).Invent.NroItems = UserList(Userindex).Invent.NroItems - 1

                End If

                'pluto:6.2
                If UserList(Userindex).Invent.WeaponEqpObjIndex = 1160 Then
                    Call Desequipar(Userindex, UserList(Userindex).Invent.WeaponEqpSlot)
                    Call QuitarObjetos(1160, 1, Userindex)
                    UserList(Userindex).Invent.NroItems = UserList(Userindex).Invent.NroItems - 1

                End If

            End If

        End If

        ' Para que las mascotas no sigan intentando luchar y
        ' comiencen a seguir al amo
        Loco = 11
        Dim J As Integer

        For J = 1 To MAXMASCOTAS

            If UserList(Userindex).MascotasIndex(J) > 0 Then
                If Npclist(UserList(Userindex).MascotasIndex(J)).TargetNpc = NpcIndex Then Npclist(UserList( _
                                                                                                   Userindex).MascotasIndex(J)).TargetNpc = 0
                Npclist(UserList(Userindex).MascotasIndex(J)).Movement = SIGUE_AMO

            End If

        Next J

        Call MuereNpc(NpcIndex, Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("userdañonpc Jug: " & UserList(Userindex).Name & " Npc: " & Npclist(Userindex).Name & " Dan: " & _
                  daño & " Loc: " & Loco & " " & Err.number & " D: " & Err.Description)

End Sub

Public Sub NpcDaño(ByVal NpcIndex As Integer, ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim daño As Integer
    Dim lugar As Integer
    Dim absorbido As Integer
    Dim npcfile As String
    Dim antdaño As Integer
    Dim defbarco As Integer
    Dim obj As ObjData
    Dim Dueñoindex As Integer

    daño = RandomNumber(Npclist(NpcIndex).Stats.MinHIT, Npclist(NpcIndex).Stats.MaxHIT)
    antdaño = daño

    'pluto 2.17 ----------
    If Npclist(NpcIndex).NPCtype = 60 And Npclist(NpcIndex).MaestroUser > 0 Then
        Dueñoindex = Npclist(NpcIndex).MaestroUser
        daño = RandomNumber(CInt(UserList(Dueñoindex).Montura.Golpe(UserList(Dueñoindex).flags.ClaseMontura) / 2), _
                            UserList(Dueñoindex).Montura.Golpe(UserList(Dueñoindex).flags.ClaseMontura))

    End If

    '---------------------

    If UserList(Userindex).flags.Navegando = 1 Then
        obj = ObjData(UserList(Userindex).Invent.BarcoObjIndex)
        defbarco = RandomNumber(obj.MinDef, obj.MaxDef)

    End If

    lugar = RandomNumber(1, 6)
    'pluto:6.0A
    'Call SubirSkill(UserIndex, DefArma)

    'pluto:2-3-04 tornado merluzo
    If Npclist(NpcIndex).Name = "Tornado" Then
        Call UserDie(Userindex)

        If lugar > 0 Then Call WarpUserChar(Userindex, 62, 30, 62, True)
        If lugar > 2 Then Call WarpUserChar(Userindex, 111, 11, 88, True)
        If lugar > 4 Then Call WarpUserChar(Userindex, 47, 58, 37, True)
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 139)

    End If

    Dim a As Integer, aa As Integer
    aa = 600 + (UserList(Userindex).Stats.UserSkills(suerte) * 3)
    a = RandomNumber(1, aa)

    'pluto:2.15
    If UserList(Userindex).flags.Demonio > 0 Or UserList(Userindex).flags.Angel > 0 Or UserList( _
       Userindex).flags.Morph > 0 Or EsNewbie(Userindex) Then a = 10

    'Si tiene alas absorbe el golpe
    If UserList(Userindex).Invent.AlaEqpObjIndex > 0 Then
        obj = ObjData(UserList(Userindex).Invent.AlaEqpObjIndex)
        absorbido = RandomNumber(obj.MinDef, obj.MaxDef)
        absorbido = absorbido + defbarco
        daño = daño - absorbido

        If daño < 1 Then daño = 1

    End If

    Select Case lugar

    Case bCabeza

        'Si tiene casco absorbe el golpe
        If UserList(Userindex).Invent.CascoEqpObjIndex > 0 Then
            obj = ObjData(UserList(Userindex).Invent.CascoEqpObjIndex)
            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)
            absorbido = absorbido + defbarco
            daño = daño - absorbido

            If daño < 1 Then daño = 1

            'pluto:6.9
            'If a = 2 And ObjData(UserList(UserIndex).Invent.CascoEqpObjIndex).nocaer = 0 And ObjData(UserList(UserIndex).Invent.CascoEqpObjIndex).objetoespecial = 0 Then
            'Call SendData(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, "TW" & 140)
            'Call QuitarUserInvItem(UserIndex, UserList(UserIndex).Invent.CascoEqpSlot, 1)
            'Call SendData(ToIndex, UserIndex, 0, "||Te ha roto el Casco." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call UpdateUserInv(True, UserIndex, 0)
            'End If

        End If

    Case bPiernaIzquierda To bPiernaDerecha
        '[GAU]

        'Si tiene botas absorbe el golpe
        If UserList(Userindex).Invent.BotaEqpObjIndex > 0 Then
            obj = ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex)
            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)
            absorbido = absorbido + defbarco
            daño = daño - absorbido

            If daño < 1 Then daño = 1
            'pluto:2.4
            'If a = 2 Then
            'Call SendData(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, "TW" & 140)
            'Call QuitarUserInvItem(UserIndex, UserList(UserIndex).Invent.BotaEqpSlot, 1)
            'Call SendData(ToIndex, UserIndex, 0, "||Te ha roto las Botas." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call UpdateUserInv(True, UserIndex, 0)
            'End If

        End If

    Case bBrazoIzquierdo
        '[GAU]

        'Si tiene botas absorbe el golpe
        If UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then
            obj = ObjData(UserList(Userindex).Invent.EscudoEqpObjIndex)
            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)
            absorbido = absorbido + defbarco
            daño = daño - absorbido

            If daño < 1 Then daño = 1
            'pluto:2.4
            'If a = 3 And UserList(UserIndex).Invent.EscudoEqpSlot > 0 And ObjData(UserList(UserIndex).Invent.EscudoEqpObjIndex).objetoespecial = 0 Then
            'Call SendData(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, "TW" & 140)
            'Call QuitarUserInvItem(UserIndex, UserList(UserIndex).Invent.EscudoEqpSlot, 1)
            'Call SendData(ToIndex, UserIndex, 0, "||Te ha roto el escudo." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call UpdateUserInv(True, UserIndex, 0)
            'End If

        End If

        '[GAU]

    Case bBrazoDerecho
        '[GAU]

        If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
            obj = ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex)

            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)
            absorbido = absorbido + defbarco
            daño = daño - absorbido
            If daño < 1 Then daño = 1
            'pluto:2.4
            'If a = 3 And UserList(UserIndex).Invent.WeaponEqpSlot > 0 And ObjData(UserList(UserIndex).Invent.WeaponEqpObjIndex).objetoespecial = 0 Then
            'Call SendData(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, "TW" & 140)
            'Call QuitarUserInvItem(UserIndex, UserList(UserIndex).Invent.WeaponEqpSlot, 1)
            'Call SendData(ToIndex, UserIndex, 0, "||Te ha roto el Arma." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call UpdateUserInv(True, UserIndex, 0)
            'End If

        End If

    Case bTorso

        'Si tiene armadura absorbe el golpe
        If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
            obj = ObjData(UserList(Userindex).Invent.ArmourEqpObjIndex)
            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)
            absorbido = absorbido + defbarco
            daño = daño - absorbido

            If daño < 1 Then daño = 1
            'pluto:2.4
            'If a = 2 And ObjData(UserList(UserIndex).Invent.ArmourEqpObjIndex).nocaer = 0 And ObjData(UserList(UserIndex).Invent.ArmourEqpObjIndex).Real = 0 And ObjData(UserList(UserIndex).Invent.ArmourEqpObjIndex).Caos = 0 And ObjData(UserList(UserIndex).Invent.ArmourEqpObjIndex).objetoespecial = 0 Then
            'Call SendData(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, "TW" & 140)
            'Call QuitarUserInvItem(UserIndex, UserList(UserIndex).Invent.ArmourEqpSlot, 1)
            'Call SendData(ToIndex, UserIndex, 0, "||Te ha roto la Armadura." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call UpdateUserInv(True, UserIndex, 0)
            'End If
            'pluto:2.4
            'If a = 3 And UserList(UserIndex).Invent.EscudoEqpSlot > 0 Then
            'Call SendData(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, "TW" & 140)
            'Call QuitarUserInvItem(UserIndex, UserList(UserIndex).Invent.EscudoEqpSlot, 1)
            'Call SendData(ToIndex, UserIndex, 0, "||Te ha roto el escudo." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call UpdateUserInv(True, UserIndex, 0)
            'End If
            'If a = 4 And UserList(UserIndex).Invent.WeaponEqpSlot > 0 Then
            'Call SendData(ToPCArea, UserIndex, UserList(UserIndex).Pos.Map, "TW" & 140)
            'Call QuitarUserInvItem(UserIndex, UserList(UserIndex).Invent.WeaponEqpSlot, 1)
            'Call SendData(ToIndex, UserIndex, 0, "||Te ha roto el Arma." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call UpdateUserInv(True, UserIndex, 0)

            'End If

        End If

    End Select

    'nati: Cambio los valores, ahora el cazador hace el daño / 2 y el guerrero el del porcentaje.
    If UCase$(UserList(Userindex).clase) = "GUERRERO" Then daño = CInt(daño - Porcentaje(daño, 75))

    'pluto:6.0
    If UCase$(UserList(Userindex).clase) = "CAZADOR" Then daño = CInt(daño / 2)

    'pluto:2.4 extra monturas
    If UserList(Userindex).flags.Montura = 1 Then
        'Dim kk As Integer
        Dim oo As Integer
        'Dim nivk As Integer
        oo = UserList(Userindex).flags.ClaseMontura
        'kk = 0
        'If oo = 2 Or oo = 3 Then kk = 2
        'If oo = 4 Then kk = 4
        'If oo = 5 Then kk = 3
        'nivk = UserList(Userindex).Montura.Nivel(oo)
        daño = daño - CInt(Porcentaje(daño, UserList(Userindex).Montura.Defcuerpo(oo))) - 1

        If daño < 1 Then daño = 1

    End If

    '------------fin pluto:2.4-------------------

    'pluto:2.5.0
    If UserList(Userindex).Invent.ArmourEqpObjIndex = 945 Or UserList(Userindex).Invent.ArmourEqpObjIndex = 946 Then
        Dim bup As Byte
        bup = RandomNumber(1, 100)

        If bup > 40 Then
            daño = daño - CInt(Porcentaje(daño, 50))
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & 101)

            If daño < 1 Then daño = 1

        End If

    End If

    'pluto:6.0A
    If Npclist(NpcIndex).Raid > 0 Then
        bup = RandomNumber(1, 100)

        If bup > 95 Then
            Call SendData(ToIndex, Userindex, 0, "||GOLPE CRÍTICO!!" & "´" & FontTypeNames.FONTTYPE_FIGHT)
            daño = 1000

        End If

    End If

    Call SendData(ToIndex, Userindex, 0, "N2" & lugar & "," & daño)

    If daño > 100 Then Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList( _
                                                                                            Userindex).Char.CharIndex & "," & 29 & "," & 0)

    If UserList(Userindex).flags.Privilegios = 0 Then UserList(Userindex).Stats.MinHP = UserList( _
       Userindex).Stats.MinHP - daño

    'REGENERA VAMPIRO
    'If UserList(UserIndex).raza = "Vampiro" Then
    'UserList(UserIndex).Stats.MinHP = UserList(UserIndex).Stats.MinHP + CInt(Porcentaje(daño, 15))
    'Call SendData(ToIndex, UserIndex, 0, "||Regeneras " & CInt(Porcentaje(daño, 15)) & " puntos de vida." & "´" & FontTypeNames.FONTTYPE_WARNING)
    'End If

    'EZE BERSERKER
    Dim Lele As Integer
    Lele = UserList(Userindex).Stats.MaxHP / 3



    If UserList(Userindex).Stats.MinHP < Lele And UserList(Userindex).raza = "Enano" Then

        'daño = daño * 1.5

        'Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList( _
                                                                             Userindex).Char.CharIndex & "´" & Hechizos(42).FXgrh & "´" & Hechizos(25).loops)
        Call SendData(ToIndex, Userindex, 0, "||¡¡¡¡¡ HAS ENTRADO EN BERSERKER !!!!!!!" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_IMPACTO_BERSERKER)

    End If
    
        If UserList(Userindex).raza = "Vampiro" Then
            'Dim bup As Byte
            bup = RandomNumber(1, 10)
            'Debug.Print bup
        If bup > 1 Then
            
                'Debug.Print UserList(Userindex).Stats.MinHP & "Antes"
                UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MinHP + Porcentaje(UserList(Userindex).Stats.MaxHP, 15)
                'Debug.Print UserList(Userindex).Stats.MinHP & "Despues"
            
        If UserList(Userindex).Stats.MinHP > UserList(Userindex).Stats.MaxHP Then UserList(Userindex).Stats.MinHP = UserList(Userindex).Stats.MaxHP

            End If
            End If

    'pluto:7.0 10% quedar 1 vida en ciclopes
    If UserList(Userindex).Stats.MinHP < 1 And UserList(Userindex).raza = "Abisario" Then
        bup = RandomNumber(1, 10)

        If bup = 3 Then UserList(Userindex).Stats.MinHP = 1

    End If

    Call SendUserStatsVida(Userindex)

    'Muere el usuario
    If UserList(Userindex).Stats.MinHP <= 0 Then

        Call SendData(ToIndex, Userindex, 0, "6")    ' Le informamos que ha muerto ;)

        'pluto:uruk baja exp
        If Npclist(NpcIndex).numero = 602 Then
            UserList(Userindex).Stats.exp = UserList(Userindex).Stats.exp - 10000

            If UserList(Userindex).Stats.exp < 0 Then UserList(Userindex).Stats.exp = 0
            Call SendData(ToIndex, Userindex, 0, "||Pierdes 10000 puntos de experiencia." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)

        End If

        'Si lo mato un guardia
        If Criminal(Userindex) And Npclist(NpcIndex).NPCtype = 2 Then
            If UserList(Userindex).Reputacion.AsesinoRep > 0 Then
                'UserList(Userindex).Reputacion.AsesinoRep = UserList(Userindex).Reputacion.AsesinoRep - vlASESINO / 4

                If UserList(Userindex).Reputacion.AsesinoRep < 0 Then 'UserList(Userindex).Reputacion.AsesinoRep = 0
            ElseIf UserList(Userindex).Reputacion.BandidoRep > 0 Then
                'UserList(Userindex).Reputacion.BandidoRep = UserList(Userindex).Reputacion.BandidoRep - vlASALTO / 4
                End If

                If UserList(Userindex).Reputacion.BandidoRep < 0 Then 'UserList(Userindex).Reputacion.BandidoRep = 0
            ElseIf UserList(Userindex).Reputacion.LadronesRep > 0 Then
                'UserList(Userindex).Reputacion.LadronesRep = UserList(Userindex).Reputacion.LadronesRep - vlCAZADOR / 3
                End If

                If UserList(Userindex).Reputacion.LadronesRep < 0 Then 'UserList(Userindex).Reputacion.LadronesRep = 0
                End If

            End If

            'pluto:2.4.5
            If Not Criminal(Userindex) Then VolverCiudadano (Userindex)

        End If

        If Npclist(NpcIndex).MaestroUser > 0 Then
            Call AllFollowAmo(Npclist(NpcIndex).MaestroUser)
        Else

            'Al matarlo no lo sigue mas
            If Npclist(NpcIndex).Stats.Alineacion = 0 Then
                Npclist(NpcIndex).Movement = Npclist(NpcIndex).flags.OldMovement
                Npclist(NpcIndex).Hostile = Npclist(NpcIndex).flags.OldHostil
                Npclist(NpcIndex).flags.AttackedBy = ""

            End If

        End If

        Call UserDie(Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("npcdaño: " & Npclist(NpcIndex).Name & " Nom: " & UserList(Userindex).Name & " N:" & Err.number & _
                  " D: " & Err.Description)

End Sub

Public Sub CheckPets(ByVal NpcIndex As Integer, ByVal Userindex As Integer)

    If Userindex = 0 Then Exit Sub

    On Error GoTo fallo

    Dim J As Integer

    For J = 1 To MAXMASCOTAS

        If UserList(Userindex).MascotasIndex(J) > 0 Then
            If UserList(Userindex).MascotasIndex(J) <> NpcIndex Then
                If Npclist(UserList(Userindex).MascotasIndex(J)).TargetNpc = 0 Then Npclist(UserList( _
                                                                                            Userindex).MascotasIndex(J)).TargetNpc = NpcIndex
                'Npclist(UserList(UserIndex).MascotasIndex(j)).Flags.OldMovement = Npclist(UserList(UserIndex).MascotasIndex(j)).Movement
                Npclist(UserList(Userindex).MascotasIndex(J)).Movement = NPC_ATACA_NPC

            End If

        End If

    Next J

    Exit Sub
fallo:
    Call LogError("checkpets " & Err.number & " D: " & Err.Description)

End Sub

Public Sub AllFollowAmo(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim J As Integer

    For J = 1 To MAXMASCOTAS

        If UserList(Userindex).MascotasIndex(J) > 0 Then
            Call FollowAmo(UserList(Userindex).MascotasIndex(J))

        End If

    Next J

    Exit Sub
fallo:
    Call LogError("allfolowamo " & Err.number & " D: " & Err.Description)

End Sub

Public Sub NpcAtacaUser(ByVal NpcIndex As Integer, ByVal Userindex As Integer)

    If Userindex = 0 Then Exit Sub

    On Error GoTo fallo

    'nati: Agrego esto para cuando te ataquen dejes de meditar.
    If UserList(Userindex).flags.Meditando Then
        Call SendData(ToIndex, Userindex, 0, "G7")
        Call SendData2(ToIndex, Userindex, 0, 54)
        Call SendData2(ToIndex, Userindex, 0, 15, UserList(Userindex).Pos.X & "," & UserList(Userindex).Pos.Y)
        UserList(Userindex).flags.Meditando = False
        UserList(Userindex).Char.FX = 0
        UserList(Userindex).Char.loops = 0
        'pluto:bug meditar
        Call SendData2(ToMap, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & _
                                                                          0 & "," & 0)

    End If

    'nati: Agrego esto para cuando te ataquen dejes de meditar.

    'nati: Agrego esto para cuando te ataquen dejes de descansar.
    If UserList(Userindex).flags.Descansar Then
        Call SendData(ToIndex, Userindex, 0, "||Te levantas." & "´" & FontTypeNames.FONTTYPE_INFO)
        UserList(Userindex).flags.Descansar = False
        Call SendData2(ToIndex, Userindex, 0, 41)

    End If

    'nati: Agrego esto para cuando te ataquen dejes de descansar.

    'pluto:2.4.1
    If Npclist(NpcIndex).flags.Paralizado > 0 Then Exit Sub

    ' El npc puede atacar ???
    If Npclist(NpcIndex).CanAttack = 1 Then
        Call CheckPets(NpcIndex, Userindex)

        If Npclist(NpcIndex).Target = 0 Then Npclist(NpcIndex).Target = Userindex

        If UserList(Userindex).flags.AtacadoPorNpc = 0 And UserList(Userindex).flags.AtacadoPorUser = 0 Then UserList( _
           Userindex).flags.AtacadoPorNpc = NpcIndex
    Else
        Exit Sub

    End If

    Npclist(NpcIndex).CanAttack = 0

    If Npclist(NpcIndex).flags.Snd1 > 0 Then Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & _
                                                                                                             Npclist(NpcIndex).flags.Snd1)

    'pluto:2.17 animacion ataque npc nuevo
    If Npclist(NpcIndex).Anima = 1 Then

        'If (Npclist(NpcIndex).Numero > 622 And Npclist(NpcIndex).Numero < 636) Or Npclist(NpcIndex).Numero = 530 Or Npclist(NpcIndex).Numero = 666 Or (Npclist(NpcIndex).Numero > 675 And Npclist(NpcIndex).Numero < 679) Then
        'Call SendData2(ToPCArea, UserIndex, UserList(UserIndex).pos.Map, 22, Npclist(NpcIndex).Char.CharIndex & "," & Npclist(NpcIndex).Char.Heading + 68 & "," & 0)
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 94, Npclist(NpcIndex).Char.CharIndex & "," & _
                                                                             Npclist(NpcIndex).Char.Heading)

    End If

    If NpcImpacto(NpcIndex, Userindex) Then
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_IMPACTO)

        If UserList(Userindex).flags.Navegando = 0 Then Call SendData2(ToPCArea, Userindex, UserList( _
                                                                                            Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & FXSANGRE & "," & 0)
        Call NpcDaño(NpcIndex, Userindex)

        '¿Puede envenenar?
        If Npclist(NpcIndex).veneno > 0 Then Call NpcEnvenenarUser(Userindex, Npclist(NpcIndex).veneno)
    Else
        Call SendData(ToIndex, Userindex, 0, "N1")

    End If

    '-----Tal vez suba los skills------
    'pluto:6.0A
    If Npclist(NpcIndex).Arquero = 0 Then
        Call SubirSkill(Userindex, Tacticas)
    Else
        Call SubirSkill(Userindex, EvitarProyec)

    End If

    Call senduserstatsbox(val(Userindex))

    'Controla el nivel del usuario
    Call CheckUserLevel(Userindex)
    Call senduserstatsbox(Userindex)
    Exit Sub
fallo:
    Call LogError("npcatacauser " & Err.number & " D: " & Err.Description)

End Sub

Function NpcImpactoNpc(ByVal atacante As Integer, ByVal Victima As Integer) As Boolean

    On Error GoTo fallo

    Dim PoderAtt As Long, PoderEva As Long, dif As Long
    Dim ProbExito As Long

    PoderAtt = Npclist(atacante).PoderAtaque
    PoderEva = Npclist(Victima).PoderEvasion
    ProbExito = Maximo(10, Minimo(90, 50 + ((PoderAtt - PoderEva) * 0.4)))
    NpcImpactoNpc = (RandomNumber(1, 100) <= ProbExito)
    Exit Function
fallo:
    Call LogError("npcimpactonpc " & Err.number & " D: " & Err.Description)

End Function

Public Sub NpcDañoNpc(ByVal atacante As Integer, ByVal Victima As Integer)

    On Error GoTo fallo

    Dim daño As Integer
    Dim ANpc As npc
    Dim DNpc As npc
    Dim Dueñoindex As Integer
    ANpc = Npclist(atacante)

    daño = RandomNumber(ANpc.Stats.MinHIT, ANpc.Stats.MaxHIT)

    'pluto 2.17 ----------
    If ANpc.NPCtype = 60 Then
        Dueñoindex = ANpc.MaestroUser

        If UserList(Dueñoindex).flags.ClaseMontura = 0 Then GoTo tut
        daño = RandomNumber(UserList(Dueñoindex).Montura.Golpe(UserList(Dueñoindex).flags.ClaseMontura), UserList( _
                                                                                                         Dueñoindex).Montura.Golpe(UserList(Dueñoindex).flags.ClaseMontura))

    End If

    '---------------------
tut:

    'pluto:2.7.0
    If Npclist(Victima).Name = "Rey del Castillo" Then daño = 0

    Npclist(Victima).Stats.MinHP = Npclist(Victima).Stats.MinHP - daño

    'pluto:2.14
    If Npclist(Victima).flags.PoderEspecial6 > 0 Then
        Call MuereNpc(atacante, Victima)

    End If

    '----------------------------------------

    If Npclist(Victima).Stats.MinHP < 1 Then

        If Npclist(atacante).flags.AttackedBy <> "" Then
            Npclist(atacante).Movement = Npclist(atacante).flags.OldMovement
            Npclist(atacante).Hostile = Npclist(atacante).flags.OldHostil
        Else
            Npclist(atacante).Movement = Npclist(atacante).flags.OldMovement

        End If

        Call FollowAmo(atacante)

        Call MuereNpc(Victima, Npclist(atacante).MaestroUser)

    End If

    Exit Sub
fallo:
    Call LogError("npcdañonpc " & Err.number & " D: " & Err.Description)

End Sub

Public Sub NpcAtacaNpc(ByVal atacante As Integer, ByVal Victima As Integer)

    On Error GoTo fallo

    Dim i As Integer, castiatakado As String, reyestado As Integer
    Dim castinombre As String

    ' El npc puede atacar ???
    If Npclist(atacante).CanAttack = 1 Then
        Npclist(atacante).CanAttack = 0
        Npclist(Victima).TargetNpc = atacante
        Npclist(Victima).Movement = NPC_ATACA_NPC
    Else
        Exit Sub

    End If

    'pluto:2.4.5
    If Npclist(Victima).Pos.Map = 185 And Npclist(Victima).Name = "Defensor Fortaleza" Then Exit Sub

    'pluto:
    'COMPROBAMOS ATAQUE A CASTILLOS
    'rey herido
    'pluto:6.0A
    If Npclist(Victima).Pos.Map = mapa_castillo1 And (Npclist(Victima).NPCtype = 33 Or Npclist(Victima).NPCtype = 78) _
       Then
        Call SendData(ToAll, 0, 0, "C1")
        AtaNorte = 1

    End If

    If Npclist(Victima).Pos.Map = mapa_castillo2 And (Npclist(Victima).NPCtype = 33 Or Npclist(Victima).NPCtype = 78) _
       Then
        Call SendData(ToAll, 0, 0, "C2")
        AtaSur = 1

    End If

    If Npclist(Victima).Pos.Map = mapa_castillo3 And (Npclist(Victima).NPCtype = 33 Or Npclist(Victima).NPCtype = 78) _
       Then
        Call SendData(ToAll, 0, 0, "C3")
        AtaEste = 1

    End If

    If Npclist(Victima).Pos.Map = mapa_castillo4 And (Npclist(Victima).NPCtype = 33 Or Npclist(Victima).NPCtype = 78) _
       Then
        Call SendData(ToAll, 0, 0, "C4")
        AtaOeste = 1

    End If

    'If Npclist(Victima).Pos.Map = mapa_castillo4 And Npclist(Victima).Name = "Rey del Castillo" And Npclist(Victima).Stats.MinHP > 5400 And Npclist(Victima).Stats.MinHP < 6000 Then Call SendData(ToAll, 0, 0, "C8")
    If Npclist(Victima).Pos.Map = 185 And Npclist(Victima).NPCtype = 61 Then
        Call SendData(ToAll, 0, 0, "V8")
        AtaForta = 1

    End If

    'If Npclist(Victima).Pos.Map = 185 And Npclist(Victima).Name = "Defensor Fortaleza" And Npclist(Victima).Stats.MinHP > 5000 And Npclist(Victima).Stats.MinHP < 6000 Then Call SendData(ToAll, 0, 0, "V9")

    If Npclist(atacante).flags.Snd1 > 0 Then Call SendData(ToNPCArea, atacante, Npclist(atacante).Pos.Map, "TW" & _
                                                                                                           Npclist(atacante).flags.Snd1)

    'pluto:2.17 animacion ataque npc nuevo-------
    If Npclist(atacante).Anima = 1 Then
        Call SendData2(ToNPCArea, atacante, Npclist(atacante).Pos.Map, 94, Npclist(atacante).Char.CharIndex & "," & _
                                                                           Npclist(atacante).Char.Heading)

    End If

    '--------------------------------------------

    If NpcImpactoNpc(atacante, Victima) Then

        If Npclist(Victima).flags.Snd2 > 0 Then
            Call SendData(ToNPCArea, Victima, Npclist(Victima).Pos.Map, "TW" & Npclist(Victima).flags.Snd2)
        Else
            Call SendData(ToNPCArea, Victima, Npclist(Victima).Pos.Map, "TW" & SND_IMPACTO2)



        End If

        If Npclist(atacante).MaestroUser > 0 Then
            Call SendData(ToNPCArea, atacante, Npclist(atacante).Pos.Map, "TW" & SND_IMPACTO)
        Else
            Call SendData(ToNPCArea, Victima, Npclist(Victima).Pos.Map, "TW" & SND_IMPACTO)

        End If

        Call NpcDañoNpc(atacante, Victima)

    Else

        If Npclist(atacante).MaestroUser > 0 Then
            Call SendData(ToNPCArea, atacante, Npclist(atacante).Pos.Map, "TW" & SOUND_SWING)
        Else
            Call SendData(ToNPCArea, Victima, Npclist(Victima).Pos.Map, "TW" & SOUND_SWING)

        End If

    End If

    Exit Sub
fallo:
    Call LogError("npcatacanpc " & Err.number & " D: " & Err.Description)

End Sub

Public Sub UsuarioAtacaNpc(ByVal Userindex As Integer, ByVal NpcIndex As Integer)

    On Error GoTo fallo
    
    'NPC StyleIAO
    If UserList(Userindex).flags.AfectaNPC = 0 Then
        Npclist(NpcIndex).flags.Oponente = 0
    End If
    
    Dim NombreU As Integer
    Dim NPCAnterior As Integer
    
    NPCAnterior = UserList(Userindex).flags.AfectaNPC
    NombreU = Npclist(NpcIndex).flags.Oponente
    'Debug.Print NombreU & "Lele"
    'Debug.Print Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And UserList(Userindex).flags.Seguro = True And Not Npclist(NpcIndex).flags.Oponente = Userindex And NombreU > 0
    
    'If UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos Then
    'Call SendData(ToIndex, Userindex, 0, "||asdasdasdasd " & UserList(Npclist(NpcIndex).flags.Oponente).Name & FONTTYPE_FIGHT)
    'Exit Sub
        'Debug.Print "LELE"
    'End If
    If Not NombreU = 0 Then
    If MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "EVENTO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "CASTILLO" And UserList(Userindex).Pos.Map <> 182 And UserList(Userindex).Pos.Map <> 92 And UserList(Userindex).Pos.Map <> 279 And UserList(Userindex).Pos.Map <> 165 Then
        If UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And Not UserList(NombreU).flags.partyNum = UserList(Userindex).flags.partyNum Or UserList(NombreU).flags.partyNum = 0 Then
            If Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And UserList(Userindex).flags.Seguro = True And Not Npclist(NpcIndex).flags.Oponente = Userindex Then
        'If Not Npclist(NpcIndex).flags.Oponente = Userindex Then
            Call SendData(ToIndex, Userindex, 0, "||No podes atacar este npc, esta afectado por " & UserList(Npclist(NpcIndex).flags.Oponente).Name & ", deberas desactivar el SEGURO para poder hacerlo, pero pagarás con un gran castigo." & "´" & FONTTYPE_INFO)
            Exit Sub
        ElseIf Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And UserList(Userindex).flags.Seguro = False Then
            UserList(Userindex).Faccion.Castigo = 10
            UserList(Userindex).Faccion.FuerzasCaos = 0
            UserList(Userindex).Faccion.ArmadaReal = 2
            End If
        End If
        End If
    End If
    
    If Not NombreU = 0 Then
    If MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "EVENTO" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(Userindex).Pos.Map).Terreno <> "CASTILLO" And UserList(Userindex).Pos.Map <> 182 And UserList(Userindex).Pos.Map <> 92 And UserList(Userindex).Pos.Map <> 279 And UserList(Userindex).Pos.Map <> 165 Then
        If UserList(NombreU).Faccion.ArmadaReal = UserList(Userindex).Faccion.ArmadaReal And Not UserList(NombreU).flags.partyNum = UserList(Userindex).flags.partyNum And UserList(Userindex).flags.partyNum = 0 Then
            If Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.ArmadaReal = UserList(Userindex).Faccion.ArmadaReal And UserList(Userindex).flags.Seguro = True And Not Npclist(NpcIndex).flags.Oponente = Userindex Then
        'If Not Npclist(NpcIndex).flags.Oponente = Userindex Then
            Call SendData(ToIndex, Userindex, 0, "||No podes atacar este npc, esta afectado por " & UserList(Npclist(NpcIndex).flags.Oponente).Name & ", deberas desactivar el SEGURO para poder hacerlo, pero pagarás con un gran castigo." & "´" & FONTTYPE_INFO)
            Exit Sub
        ElseIf Npclist(NpcIndex).flags.Oponente > 0 And UserList(NombreU).Faccion.FuerzasCaos = UserList(Userindex).Faccion.FuerzasCaos And UserList(Userindex).flags.Seguro = False Then
            UserList(Userindex).Faccion.Castigo = 10
            UserList(Userindex).Faccion.ArmadaReal = 2
            End If
        End If
        End If
    End If
    
    If NPCAnterior > 0 Then
    Npclist(NPCAnterior).flags.Oponente = 0
    End If
    
    UserList(Userindex).flags.AfectaNPC = 0
    Npclist(NpcIndex).flags.Oponente = 0
    UserList(Userindex).flags.AfectaNPC = NpcIndex
    Npclist(NpcIndex).flags.Oponente = Userindex
    
    'Debug.Print UserList(Userindex).flags.AfectaNPC
    'Debug.Print Npclist(NpcIndex).flags.Oponente
'/NPC StyleIAO

    'pluto:2.17
    'If Npclist(NpcIndex).NPCtype = 79 Then
    'If Conquistas = False Then
    'Call SendData(ToIndex, UserIndex, 0, "||No se puede conquistar ciudades en estos momentos." & FONTTYPENAMES.FONTTYPE_INFO)
    'Exit Sub
    'End If

    'If (MapInfo(Npclist(NpcIndex).Pos.Map).Dueño = 1 And UserList(UserIndex).Faccion.FuerzasCaos = 0) Or (MapInfo(Npclist(NpcIndex).Pos.Map).Dueño = 2 And UserList(UserIndex).Faccion.ArmadaReal = 0) Then
    'Call SendData(ToIndex, UserIndex, 0, "||Tu armada te prohibe atacar este NPC." & FONTTYPENAMES.FONTTYPE_GUILD)
    'Exit Sub
    'End If

    'End If
    '----------------
    'pluto:2.11
    'If Npclist(NpcIndex).Stats.Alineacion = 0 And UserList(UserIndex).Faccion.ArmadaReal > 0 Then
    'Call SendData(ToIndex, UserIndex, 0, "||Tu armada te prohibe atacar este tipo de criaturas." & FONTTYPENAMES.FONTTYPE_GUILD)
    'Exit Sub
    'End If

    'pluto:6.5--------------
    'quitar esto
    'GoTo je
    'If Npclist(NpcIndex).Raid > 0 Then
    '   If UserList(UserIndex).flags.party = False Then
    'Call SendData(ToIndex, UserIndex, 0, "||Debes estar en Party (Grupo) con 4 jugadores más para poder atacar este Monster DraG" & "´" & FontTypeNames.FONTTYPE_party)
    'Exit Sub
    '   Else
    '      If partylist(UserList(UserIndex).flags.partyNum).numMiembros < 4 Then
    'Call SendData(ToIndex, UserIndex, 0, "||Debes estar en Party (Grupo) con 4 jugadores más para poder atacar este Monster DraG" & "´" & FontTypeNames.FONTTYPE_party)
    'Exit Sub
    '       End If
    ' End If
    'If UserList(UserIndex).Stats.ELV > Npclist(NpcIndex).Raid Then
    'Call SendData(ToIndex, UserIndex, 0, "||Los Dioses no te dejan atacar este MonsterDraG, tienes demasiado nivel." & "´" & FontTypeNames.FONTTYPE_party)
    'End If
    'End If
    'je:
    '--------------------

    'pluto:2.6.0
    If (EsMascotaCiudadano(NpcIndex, Userindex) Or Npclist(NpcIndex).NPCtype = NPCTYPE_GUARDIAS) And Not Criminal( _
       Userindex) Then

        If UserList(Userindex).Faccion.ArmadaReal > 0 Then Exit Sub
        If UserList(Userindex).flags.Seguro = True Then
            Call SendData(ToIndex, Userindex, 0, "G8")
            Exit Sub

        End If

    End If

    If Distancia(UserList(Userindex).Pos, Npclist(NpcIndex).Pos) > 20 Then
        Call SendData(ToIndex, Userindex, 0, "G9")
        Exit Sub

    End If
    
    If UserList(Userindex).Faccion.SoyCaos = 1 And Npclist(NpcIndex).NPCtype = 11 Then
        Call SendData(ToIndex, Userindex, 0, "||No seas insolente, no ataques NPCs de tu facción!!" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub
    
    End If
    
        If UserList(Userindex).Faccion.SoyReal = 1 And Npclist(NpcIndex).NPCtype = 2 Then
        Call SendData(ToIndex, Userindex, 0, "||No seas insolente, no ataques NPCs de tu facción!!" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub
    
    End If

    'pluto:6.0A
    If UserList(Userindex).flags.Hambre > 0 Or UserList(Userindex).flags.Sed > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||Demasiado hambriento o sediento para poder atacar!!" & "´" & _
                                             FontTypeNames.FONTTYPE_INFO)
        Exit Sub

    End If

    If Npclist(NpcIndex).NPCtype = 33 Or Npclist(NpcIndex).NPCtype = 61 Or Npclist(NpcIndex).NPCtype = 78 Or Npclist( _
       NpcIndex).NPCtype = 77 Then

        If MapInfo(Npclist(NpcIndex).Pos.Map).Zona = "CASTILLO" Then
            Dim castiact As String

            If Npclist(NpcIndex).Pos.Map = mapa_castillo1 Then castiact = castillo1
            If Npclist(NpcIndex).Pos.Map = mapa_castillo2 Then castiact = castillo2
            If Npclist(NpcIndex).Pos.Map = mapa_castillo3 Then castiact = castillo3
            If Npclist(NpcIndex).Pos.Map = mapa_castillo4 Then castiact = castillo4

            'pluto:2.18
            If Npclist(NpcIndex).Pos.Map = 268 Then castiact = castillo1
            If Npclist(NpcIndex).Pos.Map = 269 Then castiact = castillo2
            If Npclist(NpcIndex).Pos.Map = 270 Then castiact = castillo3
            If Npclist(NpcIndex).Pos.Map = 271 Then castiact = castillo4

            '------------------------------
            If Npclist(NpcIndex).Pos.Map = 185 Then castiact = fortaleza

            If UserList(Userindex).GuildInfo.GuildName = "" Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes clan!!" & "´" & FontTypeNames.FONTTYPE_FIGHT)
                Exit Sub

            End If

            If UserList(Userindex).GuildInfo.GuildName = castiact Then
                Call SendData(ToIndex, Userindex, 0, "||No puedes atacar tu castillo" & "´" & _
                                                     FontTypeNames.FONTTYPE_FIGHT)
                Exit Sub

            End If

            Set UserList(Userindex).GuildRef = FetchGuild(UserList(Userindex).GuildInfo.GuildName)

            If Not UserList(Userindex).GuildRef Is Nothing Then
                If UserList(Userindex).GuildRef.IsAllie(castiact) Then
                    Call SendData(ToIndex, Userindex, 0, "||No puedes atacar castillos de clanes aliados :P" & "´" & _
                                                         FontTypeNames.FONTTYPE_FIGHT)
                    Exit Sub

                End If

            End If

        End If

    End If

    'pluto:2.4.1

    If UserList(Userindex).Pos.Map = 185 And (UserList(Userindex).GuildInfo.GuildName <> castillo1 Or UserList( _
                                              Userindex).GuildInfo.GuildName <> castillo2 Or UserList(Userindex).GuildInfo.GuildName <> castillo3 Or _
                                              UserList(Userindex).GuildInfo.GuildName <> castillo4) Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes atacar Fortaleza sin tener Conquistado los 4 Castillos." & _
                                             "´" & FontTypeNames.FONTTYPE_FIGHT)
        Exit Sub

    End If

    'pluto.6.0A
    If UserList(Userindex).GuildInfo.GuildName <> "" Then
        If UserList(Userindex).GuildRef.Nivel < 2 And Npclist(NpcIndex).NPCtype = 61 And UserList(Userindex).Pos.Map _
           = 185 Then
            Call SendData(ToIndex, Userindex, 0, "||Tu Clan no tiene suficiente Nivel." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)
            Exit Sub

        End If

    End If

    '-----------------
    'pluto:2.4.5
    If Npclist(NpcIndex).MaestroUser <> 0 Then
        If UserList(Npclist(NpcIndex).MaestroUser).flags.Privilegios > 0 Then
            'Call SendData(ToIndex, UserIndex, 0, "||No puedes atacar Administradores del Juego" & FONTTYPENAMES.FONTTYPE_WARNING)
            Exit Sub

        End If

    End If

    If UserList(Userindex).flags.Seguro = 1 And Npclist(NpcIndex).MaestroUser <> 0 Then
        If Not Criminal(Npclist(NpcIndex).MaestroUser) Then
            Call SendData(ToIndex, Userindex, 0, "G8")
            Exit Sub

        End If

    End If

    'pluto:6.6--------
    If Npclist(NpcIndex).MaestroUser = Userindex Then
        Call SendData(ToIndex, Userindex, 0, "||No puedes atacar tus mascotas." & "´" & FontTypeNames.FONTTYPE_FIGHT)
        Exit Sub

    End If

    '-----------------

    If UserList(Userindex).Faccion.ArmadaReal = 1 And Npclist(NpcIndex).MaestroUser <> 0 And MapInfo(Npclist( _
                                                                                                     NpcIndex).Pos.Map).Zona <> "CASTILLO" Then

        If Not Criminal(Npclist(NpcIndex).MaestroUser) Then
            Call SendData(ToIndex, Userindex, 0, _
                          "||Los soldados del Ejercito Real tienen prohibido atacar ciudadanos y sus macotas." & "´" & _
                          FontTypeNames.FONTTYPE_WARNING)
            Exit Sub

        End If

    End If

    'la legion
    'If UserList(UserIndex).Faccion.ArmadaReal = 2 And Npclist(NpcIndex).MaestroUser <> 0 And (Npclist(NpcIndex).Pos.Map < 166 And Npclist(NpcIndex).Pos.Map > 169 And Npclist(NpcIndex).Pos.Map <> 185) Then
    '   If Not Criminal(Npclist(NpcIndex).MaestroUser) Then
    '      Call SendData(ToIndex, UserIndex, 0, "||Los soldados de la Legión tienen prohibido atacar ciudadanos y sus macotas." & FONTTYPENAMES.FONTTYPE_WARNING)
    '     Exit Sub
    'End If
    'End If

    'pluto:2.14
    If UserList(Userindex).flags.Morph = 0 Then
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "KO" & UserList(Userindex).Char.CharIndex)
    Else
        Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 94, UserList(Userindex).Char.CharIndex & "," _
                                                                             & UserList(Userindex).Char.Heading)

    End If

    Call NpcAtacado(NpcIndex, Userindex)

    If UserImpactoNpc(Userindex, NpcIndex) Then

        If Npclist(NpcIndex).flags.Snd2 > 0 Then
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & Npclist(NpcIndex).flags.Snd2)
        Else
            'Debug.Print UserList(Userindex).Invent.MunicionEqpObjIndex & "sonidito"


            'Debug.Print OBJTYPE_FLECHAS


            If UserList(Userindex).Invent.MunicionEqpObjIndex = 607 Or UserList(Userindex).Invent.MunicionEqpObjIndex = 1281 Or UserList(Userindex).Invent.MunicionEqpObjIndex = 480 Or UserList(Userindex).Invent.MunicionEqpObjIndex = 551 Or UserList(Userindex).Invent.MunicionEqpObjIndex = 552 Or UserList(Userindex).Invent.MunicionEqpObjIndex = 553 Or UserList(Userindex).Invent.MunicionEqpObjIndex = 606 Or UserList(Userindex).Invent.MunicionEqpObjIndex = 608 Then
                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_IMPACTO_ARROW)
            Else
                Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SND_IMPACTO2)
            End If


        End If

        Call UserDañoNpc(Userindex, NpcIndex)

    Else
        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_SWING)
        Call SendData(ToIndex, Userindex, 0, "U1")

    End If

    Exit Sub
fallo:
    Call LogError("usuarioatacanpc: " & UserList(Userindex).Name & " " & Npclist(NpcIndex).Name & " " & Err.number & _
                  " D: " & Err.Description)

End Sub

Public Sub UsuarioAtaca(ByVal Userindex As Integer)

    On Error GoTo fallo

    'pluto:2.23----------------------------
    'If UserList(UserIndex).flags.PuedeAtacar = 1 Then
    If IntervaloPermiteAtacar(Userindex) Then

        '---------------------------------------
        'Quitamos stamina
        If UserList(Userindex).Stats.MinSta >= 5 Then
            Call QuitarSta(Userindex, RandomNumber(1, 5))
        Else
            Call SendData(ToIndex, Userindex, 0, "L7")
            Exit Sub

        End If

        UserList(Userindex).flags.PuedeAtacar = 0

        Dim AttackPos As WorldPos
        AttackPos = UserList(Userindex).Pos
        Call HeadtoPos(UserList(Userindex).Char.Heading, AttackPos)

        'Exit if not legal
        If AttackPos.X < XMinMapSize Or AttackPos.X > XMaxMapSize Or AttackPos.Y <= YMinMapSize Or AttackPos.Y > _
           YMaxMapSize Then
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_SWING)
            Exit Sub

        End If

        Dim index As Integer
        index = MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).Userindex

        'Look for user
        If index > 0 Then
            Call UsuarioAtacaUsuario(Userindex, MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).Userindex)
            Call senduserstatsbox(Userindex)
            Call senduserstatsbox(MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).Userindex)
            Exit Sub

        End If

        'Look for NPC
        If MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).NpcIndex > 0 Then

            If Npclist(MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).NpcIndex).Attackable Then

                If Npclist(MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).NpcIndex).MaestroUser > 0 And MapInfo( _
                   Npclist(MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).NpcIndex).Pos.Map).Pk = False Then
                    Call SendData(ToIndex, Userindex, 0, "P8")
                    Exit Sub

                End If

                'pluto:2.17 PLUTO INUTIL
                'If UserList(UserIndex).Bebe > 0 And Npclist(MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).NpcIndex).GiveEXP > 200 Then
                'Call SendData(ToIndex, UserIndex, 0, "L5")
                'Exit Sub
                'End If

                Call UsuarioAtacaNpc(Userindex, MapData(AttackPos.Map, AttackPos.X, AttackPos.Y).NpcIndex)

            Else
                Call SendData(ToIndex, Userindex, 0, "L5")

            End If

            Call senduserstatsbox(Userindex)

            Exit Sub

        End If

        'pluto:2.14
        If UserList(Userindex).flags.Morph = 0 Then
            Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "KO" & UserList(Userindex).Char.CharIndex)
        Else
            Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 94, UserList(Userindex).Char.CharIndex & _
                                                                                 "," & UserList(Userindex).Char.Heading)

        End If

        Call SendData(ToPCArea, Userindex, UserList(Userindex).Pos.Map, "TW" & SOUND_SWING)
        Call senduserstatsbox(Userindex)

    End If

    Exit Sub
fallo:
    Call LogError("usuarioataca " & Err.number & " D: " & Err.Description)

End Sub

Public Function UsuarioImpacto(ByVal AtacanteIndex As Integer, _
                               ByVal VictimaIndex As Integer) As Boolean

    On Error GoTo fallo

    Dim ProbRechazo As Long
    Dim Rechazo As Boolean
    Dim ProbExito As Long
    Dim PoderAtaque As Long
    Dim UserPoderEvasion As Long
    Dim UserPoderEvasionEscudo As Long
    Dim Arma As Integer
    Dim proyectil As Boolean
    Dim Skilltactico As Long
    Dim SkillDefensa As Long

    'Skilltactico = CInt(UserList(VictimaIndex).Stats.UserSkills(tacticas) / 2)
    SkillDefensa = CInt(UserList(VictimaIndex).Stats.UserSkills(Defensa) / 2)

    Arma = UserList(AtacanteIndex).Invent.WeaponEqpObjIndex
    proyectil = ObjData(Arma).proyectil = 1

    'Calculamos el poder de evasion...
    'pluto:2.17
    If proyectil Then
        UserPoderEvasion = PoderEvasion(VictimaIndex, EvitarProyec)
        Skilltactico = CInt(UserList(VictimaIndex).Stats.UserSkills(EvitarProyec) / 2)
    Else
        UserPoderEvasion = PoderEvasion(VictimaIndex, Tacticas)
        Skilltactico = CInt(UserList(VictimaIndex).Stats.UserSkills(Tacticas) / 2)

    End If

    If UserList(VictimaIndex).Invent.EscudoEqpObjIndex > 0 Then
        UserPoderEvasionEscudo = PoderEvasionEscudo(VictimaIndex)
        UserPoderEvasion = UserPoderEvasion + UserPoderEvasionEscudo
    Else
        UserPoderEvasionEscudo = 0

    End If

    'Esta usando un arma ???
    If UserList(AtacanteIndex).Invent.WeaponEqpObjIndex > 0 Then

        If proyectil Then
            PoderAtaque = PoderAtaqueProyectil(AtacanteIndex)
        Else
            PoderAtaque = PoderAtaqueArma(AtacanteIndex)

        End If

        ProbExito = Maximo(10, Minimo(90, 50 + ((PoderAtaque - UserPoderEvasion) * 0.4)))

        'Else
        'PoderAtaque = PoderAtaqueWresterling(AtacanteIndex)
        ' ProbExito = Maximo(10, Minimo(90, 50 + _
          ((PoderAtaque - UserPoderEvasion) * 0.4)))

    End If

    UsuarioImpacto = (RandomNumber(1, 100) <= ProbExito)

    ' el usuario esta usando un escudo ???
    If UserList(VictimaIndex).Invent.EscudoEqpObjIndex > 0 Then

        'Fallo ???
        If UsuarioImpacto = False Then
            If SkillDefensa = 0 Then SkillDefensa = 1
            If Skilltactico = 0 Then Skilltactico = 1

            ProbRechazo = Maximo(10, Minimo(90, 100 * (SkillDefensa / (SkillDefensa + Skilltactico))))
            Rechazo = (RandomNumber(1, 100) <= ProbRechazo)

            If Rechazo = True Then
                'Se rechazo el ataque con el escudo
                Call SendData(ToPCArea, AtacanteIndex, UserList(AtacanteIndex).Pos.Map, "TW" & SND_ESCUDO)
                Call SendData(ToIndex, AtacanteIndex, 0, "8")
                Call SendData(ToIndex, VictimaIndex, 0, "7")
                Call SubirSkill(VictimaIndex, Defensa)

            End If

        End If

    End If

    'pluto:2.17 ------------------------------------
    If UsuarioImpacto Then    'acierta golpe
        If Arma > 0 Then
            If Not proyectil Then
                Call SubirSkill(AtacanteIndex, Armas)

            Else
                Call SubirSkill(AtacanteIndex, Proyectiles)

            End If

        End If

    Else    'fallo el golpe

        If Arma > 0 Then
            If Not proyectil Then
                Call SubirSkill(VictimaIndex, Tacticas)

            Else
                Call SubirSkill(VictimaIndex, EvitarProyec)

            End If

        End If

    End If

    '--------------------------------------
    Exit Function
fallo:
    Call LogError("usuarioimpacto " & Err.number & " D: " & Err.Description)

End Function

Public Sub UsuarioAtacaUsuario(ByVal AtacanteIndex As Integer, _
                               ByVal VictimaIndex As Integer)

    On Error GoTo fallo

    'IRON AO: No puedes atacar INVISIBLE
    'If UserList(AtacanteIndex).flags.Invisible = 1 Then
    'Call SendData(ToIndex, AtacanteIndex, 0, "||No puedes atacar Invisible." & "´" & FontTypeNames.FONTTYPE_info)
    'Exit Sub
    'End If

    If Not PuedeAtacar(AtacanteIndex, VictimaIndex) Then Exit Sub
    
    'Dim NPCAnterior As Integer
    'NPCAnterior = UserList(VictimaIndex).flags.AfectaNPC
    
    'If NPCAnterior > 0 Then
     '   Npclist(NPCAnterior).flags.Oponente = 0
    'End If
    'UserList(VictimaIndex).flags.AfectaNPC = 0

    'If Distancia(UserList(AtacanteIndex).Pos, UserList(VictimaIndex).Pos) > 20 Then
     '   Call SendData(ToIndex, AtacanteIndex, 0, "G9")
      '  Exit Sub

    'End If

    'pluto:2.14
    If UserList(AtacanteIndex).flags.Morph = 0 Then
        Call SendData(ToPCArea, AtacanteIndex, UserList(AtacanteIndex).Pos.Map, "KO" & UserList( _
                                                                                AtacanteIndex).Char.CharIndex)
    Else
        Call SendData2(ToPCArea, AtacanteIndex, UserList(AtacanteIndex).Pos.Map, 94, UserList( _
                                                                                     AtacanteIndex).Char.CharIndex & "," & UserList(AtacanteIndex).Char.Heading)

    End If

    'pluto:6.0A borro esto creo que sobra
    'Call SendData(ToPCArea, AtacanteIndex, UserList(AtacanteIndex).Pos.Map, "KO" & UserList(AtacanteIndex).Char.CharIndex)

    Call UsuarioAtacadoPorUsuario(AtacanteIndex, VictimaIndex)

    If UsuarioImpacto(AtacanteIndex, VictimaIndex) Then
        Call SendData(ToPCArea, AtacanteIndex, UserList(AtacanteIndex).Pos.Map, "TW" & SND_IMPACTO)

        If UserList(VictimaIndex).flags.Navegando = 0 Then Call SendData2(ToPCArea, VictimaIndex, UserList( _
                                                                                                  VictimaIndex).Pos.Map, 22, UserList(VictimaIndex).Char.CharIndex & "," & FXSANGRE & "," & 0)

        Call UserDañoUser(AtacanteIndex, VictimaIndex)
    Else
        Call SendData(ToPCArea, AtacanteIndex, UserList(AtacanteIndex).Pos.Map, "TW" & SOUND_SWING)
        Call SendData(ToIndex, AtacanteIndex, 0, "U1")
        Call SendData(ToIndex, VictimaIndex, 0, "U3" & UserList(AtacanteIndex).Name)

    End If

    Exit Sub
fallo:
    Call LogError("usuarioatacausuario " & Err.number & " D: " & Err.Description)

End Sub

Public Sub UserDañoUser(ByVal AtacanteIndex As Integer, ByVal VictimaIndex As Integer)

    On Error GoTo fallo

    Dim daño As Long, antdaño As Integer
    Dim lugar As Integer, absorbido As Long
    Dim defbarco As Integer

    Dim obj As ObjData

    'nati: Agrego esto para cuando te ataquen dejes de meditar.
    If UserList(VictimaIndex).flags.Meditando Then
        Call SendData(ToIndex, VictimaIndex, 0, "G7")
        Call SendData2(ToIndex, VictimaIndex, 0, 54)
        Call SendData2(ToIndex, VictimaIndex, 0, 15, UserList(VictimaIndex).Pos.X & "," & UserList(VictimaIndex).Pos.Y)
        UserList(VictimaIndex).flags.Meditando = False
        UserList(VictimaIndex).Char.FX = 0
        UserList(VictimaIndex).Char.loops = 0
        'pluto:bug meditar
        Call SendData2(ToMap, VictimaIndex, UserList(VictimaIndex).Pos.Map, 22, UserList(VictimaIndex).Char.CharIndex _
                                                                                & "," & 0 & "," & 0)

    End If

    'nati: Agrego esto para cuando te ataquen dejes de meditar.

    'nati: Agrego esto para cuando te ataquen dejes de descansar.
    If UserList(VictimaIndex).flags.Descansar Then
        Call SendData(ToIndex, VictimaIndex, 0, "||Te levantas." & "´" & FontTypeNames.FONTTYPE_INFO)
        UserList(VictimaIndex).flags.Descansar = False
        Call SendData2(ToIndex, VictimaIndex, 0, 41)

    End If

    'nati: Agrego esto para cuando te ataquen dejes de descansar.

    daño = CalcularDaño(AtacanteIndex)
    antdaño = daño

    'pluto:6.0A skills
    'If ObjData(UserList(AtacanteIndex).Invent.WeaponEqpObjIndex).proyectil > 0 Then
    '   daño = daño - CInt(Porcentaje(daño, CInt(UserList(VictimaIndex).Stats.UserSkills(DefProyec) / 10)))
    '  Call SubirSkill(VictimaIndex, DefProyec)
    'Else
    '   daño = daño - CInt(Porcentaje(daño, CInt(UserList(VictimaIndex).Stats.UserSkills(DefArma) / 10)))
    '  Call SubirSkill(VictimaIndex, DefArma)
    'End If
    '------------------------

    If UserList(VictimaIndex).flags.Angel > 0 Then daño = CInt(daño - (daño * 0.5))
    If UserList(AtacanteIndex).flags.Demonio > 0 Then daño = CInt(daño + (daño * 0.5))

    'nati:agrego que el berseker produce +20%
    'If UserList(AtacanteIndex).raza = "Orco" And UserList(AtacanteIndex).Counters.Morph > 0 Then
     '   daño = daño + CInt(Porcentaje(daño, 20))

    'End If

    'nati:fin

    'RACIAL: LICANTROPO
    If UserList(AtacanteIndex).raza = "Licantropos" Then
        Dim probi As Integer
        probi = RandomNumber(1, 100) + CInt((UserList(AtacanteIndex).Stats.UserSkills(suerte) / 40))

        If probi > 1 Then
            daño = daño + CInt(Porcentaje(daño, 20))
            Call SendData(ToIndex, VictimaIndex, 0, "||Recibes un Golpe Crítico!!" & "´" & _
                                                    FontTypeNames.FONTTYPE_WARNING)
            Call SendData(ToIndex, AtacanteIndex, 0, "||Golpe Crítico!!" & "´" & FontTypeNames.FONTTYPE_WARNING)

        End If

    End If
    
    'RACIAL: LICANTROPO

    'pluto:2.11
    'If UserList(AtacanteIndex).GranPoder > 0 Then daño = CInt(daño + daño)

    'EZE BERSERKER
    Dim Lele As Integer
    Lele = UserList(AtacanteIndex).Stats.MaxHP / 3



    If UserList(AtacanteIndex).Stats.MinHP < Lele And UserList(AtacanteIndex).raza = "Enano" Then

        daño = daño * 1.5

    End If
    
    If UserList(AtacanteIndex).raza = "Elfo Oscuro" Then
        daño = daño + CInt(Porcentaje(daño, 2))
    End If
    
    If UserList(AtacanteIndex).clase = "Arquero" Or UserList(AtacanteIndex).clase = "Cazador" And UserList(VictimaIndex).raza = "NoMuerto" Then
    'Debug.Print daño
    daño = daño - Porcentaje(daño, 10)
    'Debug.Print daño
    End If
    
    If UserList(VictimaIndex).raza = "Tauros" Then
    'Debug.Print daño
    daño = daño - Porcentaje(daño, 5)
    'Debug.Print daño
    End If

    'balance de daño global para todas las clases y razas
    'Debug.Print daño & "antes"
    
    daño = daño - CInt(Porcentaje(daño, 20))

    'Debug.Print daño & "despues"

    'pluto:2.13
    If UserList(VictimaIndex).flags.Montura = 1 Then
        'Dim kk As Integer
        Dim oo As Integer
        'Dim nivk As Integer
        oo = UserList(VictimaIndex).flags.ClaseMontura
        'kk = 0
        'If oo = 2 Or oo = 3 Then kk = 2
        'If oo = 4 Then kk = 4
        'If oo = 5 Then kk = 3
        ' nivk = UserList(VictimaIndex).Montura.Nivel(oo)

        If ObjData(UserList(AtacanteIndex).Invent.WeaponEqpObjIndex).proyectil > 0 Then
            daño = daño - CInt(Porcentaje(daño, UserList(VictimaIndex).Montura.DefFlechas(oo))) - 1
        Else
            daño = daño - CInt(Porcentaje(daño, UserList(VictimaIndex).Montura.Defcuerpo(oo))) - 1

        End If

        If daño < 1 Then daño = 1

    End If

    '------------fin pluto:2.13-------------------

    'pluto:2.15
    If UserList(AtacanteIndex).flags.Navegando = 1 Then
        obj = ObjData(UserList(AtacanteIndex).Invent.BarcoObjIndex)
        daño = daño + RandomNumber(obj.MinHIT, obj.MaxHIT)

    End If

    If UserList(VictimaIndex).flags.Navegando = 1 Then
        obj = ObjData(UserList(VictimaIndex).Invent.BarcoObjIndex)
        defbarco = RandomNumber(obj.MinDef, obj.MaxDef)

    End If

    '-----------------------------
    lugar = RandomNumber(1, 6)
    Dim a As Integer
    Dim aa As Integer
    aa = 350
    aa = aa - UserList(AtacanteIndex).Stats.UserSkills(suerte)
    a = RandomNumber(1, aa)

    'pluto:2.14
    If UserList(VictimaIndex).flags.Angel > 0 Or UserList(VictimaIndex).flags.Demonio > 0 Or UserList( _
       VictimaIndex).flags.Morph > 0 Or EsNewbie(VictimaIndex) Then a = 10

    'Si tiene botas absorbe el golpe
    If UserList(VictimaIndex).Invent.AlaEqpObjIndex > 0 Then
        obj = ObjData(UserList(VictimaIndex).Invent.AlaEqpObjIndex)

        absorbido = RandomNumber(obj.MinDef, obj.MaxDef)

        absorbido = absorbido + defbarco
        daño = daño - absorbido

        If daño < 1 Then daño = 1

        'pluto:2.4
        '   If a = 2 Then
        '       Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & 140)
        '    Call QuitarUserInvItem(VictimaIndex, UserList(VictimaIndex).Invent.BotaEqpSlot, 1)
        '      Call SendData(ToIndex, VictimaIndex, 0, "||Te ha roto las Botas." & "´" & FontTypeNames.FONTTYPE_VENENO)
        '     Call SendData(ToIndex, AtacanteIndex, 0, "||Le has roto las Botas." & "´" & FontTypeNames.FONTTYPE_VENENO)
        '    Call UpdateUserInv(True, VictimaIndex, 0)
        '    End If
    End If

    Select Case lugar

    Case bCabeza

        'Si tiene casco absorbe el golpe
        If UserList(VictimaIndex).Invent.CascoEqpObjIndex > 0 Then

            obj = ObjData(UserList(VictimaIndex).Invent.CascoEqpObjIndex)
            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)

            absorbido = absorbido + defbarco
            daño = daño - absorbido

            If daño < 0 Then daño = 1

            'pluto:6.9 'caretas no se rompen
            '  If a = 2 And ObjData(UserList(VictimaIndex).Invent.CascoEqpObjIndex).nocaer = 0 And ObjData(UserList(VictimaIndex).Invent.CascoEqpObjIndex).objetoespecial = 0 Then
            '   Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & 140)
            '  Call QuitarUserInvItem(VictimaIndex, UserList(VictimaIndex).Invent.CascoEqpSlot, 1)
            ' Call SendData(ToIndex, VictimaIndex, 0, "||Te ha roto el Casco." & "´" & FontTypeNames.FONTTYPE_VENENO)
            ' Call SendData(ToIndex, AtacanteIndex, 0, "||Le has roto el Casco." & "´" & FontTypeNames.FONTTYPE_VENENO)
            ' Call UpdateUserInv(True, VictimaIndex, 0)
            ' End If
        End If

    Case bPiernaIzquierda To bPiernaDerecha
        '[GAU]

        'Si tiene botas absorbe el golpe
        If UserList(VictimaIndex).Invent.BotaEqpObjIndex > 0 Then
            obj = ObjData(UserList(VictimaIndex).Invent.ArmourEqpObjIndex)

            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)

            absorbido = absorbido + defbarco
            daño = daño - absorbido

            If daño < 1 Then daño = 1

            'pluto:2.4
            '   If a = 2 Then
            '       Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & 140)
            '    Call QuitarUserInvItem(VictimaIndex, UserList(VictimaIndex).Invent.BotaEqpSlot, 1)
            '      Call SendData(ToIndex, VictimaIndex, 0, "||Te ha roto las Botas." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '     Call SendData(ToIndex, AtacanteIndex, 0, "||Le has roto las Botas." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '    Call UpdateUserInv(True, VictimaIndex, 0)
            '    End If
        End If

    Case bBrazoIzquierdo
        '[GAU]

        'Si tiene botas absorbe el golpe
        If UserList(VictimaIndex).Invent.EscudoEqpObjIndex > 0 Then
            obj = ObjData(UserList(VictimaIndex).Invent.EscudoEqpObjIndex)

            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)

            absorbido = absorbido + defbarco
            daño = daño - absorbido

            If daño < 1 Then daño = 1

            'pluto:2.4
            '  If a = 3 And UserList(VictimaIndex).Invent.EscudoEqpSlot > 0 And ObjData(UserList(VictimaIndex).Invent.EscudoEqpObjIndex).objetoespecial = 0 Then
            '     Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & 140)
            '     Call QuitarUserInvItem(VictimaIndex, UserList(VictimaIndex).Invent.EscudoEqpSlot, 1)
            '    Call SendData(ToIndex, VictimaIndex, 0, "||Te ha roto el Escudo." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '    Call SendData(ToIndex, AtacanteIndex, 0, "||Le has roto el Escudo." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '    Call UpdateUserInv(True, VictimaIndex, 0)
            '    End If
        End If

    Case bBrazoDerecho    'pluto:6.9

        If UserList(VictimaIndex).Invent.WeaponEqpObjIndex > 0 Then
            obj = ObjData(UserList(VictimaIndex).Invent.ArmourEqpObjIndex)

            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)
            absorbido = absorbido + defbarco
            daño = daño - absorbido
            If daño < 1 Then daño = 1

            '  If a = 3 And UserList(VictimaIndex).Invent.WeaponEqpSlot > 0 And ObjData(UserList(VictimaIndex).Invent.WeaponEqpObjIndex).objetoespecial = 0 Then
            '       Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & 140)
            '      Call QuitarUserInvItem(VictimaIndex, UserList(VictimaIndex).Invent.WeaponEqpSlot, 1)
            '     Call SendData(ToIndex, VictimaIndex, 0, "||Te ha roto el Arma." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '    Call SendData(ToIndex, AtacanteIndex, 0, "||Le has roto el Arma." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '   Call UpdateUserInv(True, VictimaIndex, 0)
            ' End If
        End If

    Case bTorso

        'Si tiene armadura absorbe el golpe
        If UserList(VictimaIndex).Invent.ArmourEqpObjIndex > 0 Then
            obj = ObjData(UserList(VictimaIndex).Invent.ArmourEqpObjIndex)

            absorbido = RandomNumber(obj.MinDef, obj.MaxDef)

            absorbido = absorbido + defbarco
            daño = daño - absorbido

            If daño < 0 Then daño = 1

            'pluto:2.4
            '   If a = 2 And ObjData(UserList(VictimaIndex).Invent.ArmourEqpObjIndex).nocaer = 0 And ObjData(UserList(VictimaIndex).Invent.ArmourEqpObjIndex).Real = 0 And ObjData(UserList(VictimaIndex).Invent.ArmourEqpObjIndex).Caos = 0 And ObjData(UserList(VictimaIndex).Invent.ArmourEqpObjIndex).objetoespecial = 0 Then
            '      Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & 140)
            '     Call QuitarUserInvItem(VictimaIndex, UserList(VictimaIndex).Invent.ArmourEqpSlot, 1)
            '    Call SendData(ToIndex, VictimaIndex, 0, "||Te ha roto la Armadura." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '   Call SendData(ToIndex, AtacanteIndex, 0, "||Le has roto la Armadura." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '  Call UpdateUserInv(True, VictimaIndex, 0)
            '     End If
            ' If a = 3 And UserList(VictimaIndex).Invent.EscudoEqpSlot > 0 Then
            '     Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & 140)
            '    Call QuitarUserInvItem(VictimaIndex, UserList(VictimaIndex).Invent.EscudoEqpSlot, 1)
            '   Call SendData(ToIndex, VictimaIndex, 0, "||Te ha roto el Escudo." & "´" & FontTypeNames.FONTTYPE_VENENO)
            '  Call SendData(ToIndex, AtacanteIndex, 0, "||Le has roto el Escudo." & "´" & FontTypeNames.FONTTYPE_VENENO)
            ' Call UpdateUserInv(True, VictimaIndex, 0)
            'End If
            'If a = 4 And UserList(VictimaIndex).Invent.WeaponEqpSlot > 0 Then
            '   Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & 140)
            '  Call QuitarUserInvItem(VictimaIndex, UserList(VictimaIndex).Invent.WeaponEqpSlot, 1)
            ' Call SendData(ToIndex, VictimaIndex, 0, "||Te ha roto el Arma." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call SendData(ToIndex, AtacanteIndex, 0, "||Le has roto el Arma." & "´" & FontTypeNames.FONTTYPE_VENENO)
            'Call UpdateUserInv(True, VictimaIndex, 0)
            'End If
        End If

    End Select

    Call SendData(ToIndex, AtacanteIndex, 0, "N5" & lugar & "," & daño & "," & UserList(VictimaIndex).Name)
    Call SendData(ToIndex, VictimaIndex, 0, "N4" & lugar & "," & daño & "," & UserList(AtacanteIndex).Name)

    If daño > 100 Then Call SendData2(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, 22, UserList( _
                                                                                                  VictimaIndex).Char.CharIndex & "," & 29 & "," & 0)
    UserList(VictimaIndex).Stats.MinHP = UserList(VictimaIndex).Stats.MinHP - daño

    'REGENERA VAMPIRO
    'If UserList(VictimaIndex).raza = "Vampiro" Then
    '   UserList(VictimaIndex).Stats.MinHP = UserList(VictimaIndex).Stats.MinHP + CInt(Porcentaje(daño, 15))
    '  Call SendData(ToIndex, VictimaIndex, 0, "||Regeneras " & CInt(Porcentaje(daño, 15)) & " puntos de vida." & "´" & FontTypeNames.FONTTYPE_WARNING)
    'End If

    'If UserList(AtacanteIndex).flags.Hambre = 0 And UserList(AtacanteIndex).flags.Sed = 0 Then
    'Si usa un arma quizas suba "Combate con armas"
    'If UserList(AtacanteIndex).Invent.WeaponEqpObjIndex > 0 Then
    '        Call SubirSkill(AtacanteIndex, Armas)
    'Else
    'sino tal vez lucha libre
    ' Call SubirSkill(AtacanteIndex, Wresterling)
    'End If

    'Call SubirSkill(AtacanteIndex, Tacticas)

    'Trata de apuñalar por la espalda al enemigo

    If PuedeApuñalar(AtacanteIndex) Then
        Call DoApuñalar(AtacanteIndex, 0, VictimaIndex, daño)
        Call SubirSkill(AtacanteIndex, Apuñalar)

    End If

    'pluto:2.17
    If ObjData(UserList(AtacanteIndex).Invent.WeaponEqpObjIndex).SubTipo = 8 Then
        If UCase$(UserList(VictimaIndex).clase) <> "BARDO" And UserList(VictimaIndex).flags.Angel = 0 And UserList( _
           VictimaIndex).flags.Demonio = 0 Then
            UserList(VictimaIndex).flags.Envenenado = 4
            Call SendData(ToIndex, VictimaIndex, 0, "|| " & UserList(AtacanteIndex).Name & " te ha envenenado!!" & _
                                                    "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, AtacanteIndex, 0, "|| " & UserList(VictimaIndex).Name & " está envenenado!!" & "´" _
                                                     & FontTypeNames.FONTTYPE_FIGHT)
        Else
            Call SendData(ToIndex, VictimaIndex, 0, "|| " & UserList(AtacanteIndex).Name & _
                                                    " te ha intentado envenenar, pero eres INMUNE!!" & "´" & FontTypeNames.FONTTYPE_FIGHT)
            Call SendData(ToIndex, AtacanteIndex, 0, "|| " & UserList(VictimaIndex).Name & " es INMUNE!!" & "´" & _
                                                     FontTypeNames.FONTTYPE_FIGHT)

        End If

    End If    'objdata

    'End If

    '[Tite]Golpe doble arma a pjs
    If UserList(VictimaIndex).Stats.MinHP > 0 Then

        'Trata de dar segundo golpe
        If PuedeDobleArma(AtacanteIndex) Then
            Call DoDobleArma(AtacanteIndex, 0, VictimaIndex, daño)
            Call SubirSkill(AtacanteIndex, DobleArma)

        End If

    End If

    '[\Tite]

    'pluto:7.0 goblin gana oro por golpe
    'If UserList(AtacanteIndex).raza = "Goblin" And UserList(VictimaIndex).Stats.GLD > CInt(daño / 10) Then
     '   UserList(AtacanteIndex).Stats.GLD = UserList(AtacanteIndex).Stats.GLD + CInt(daño / 10)
      '  UserList(VictimaIndex).Stats.GLD = UserList(VictimaIndex).Stats.GLD - CInt(daño / 10)
      '  Call SendData(ToIndex, VictimaIndex, 0, "||Te ha robado " & CInt(daño / 10) & " Monedas de Oro." & "´" & _
                                                FontTypeNames.FONTTYPE_VENENO)
       ' Call SendData(ToIndex, AtacanteIndex, 0, "||Has robado " & CInt(daño / 10) & " Monedas de Oro." & "´" & _
                                                 FontTypeNames.FONTTYPE_VENENO)
        'SendUserStatsOro (VictimaIndex)
        'SendUserStatsOro (AtacanteIndex)

    'End If
    
        If UserList(VictimaIndex).raza = "Vampiro" Then
            Dim bup As Byte
            bup = RandomNumber(1, 10)
            'Debug.Print bup
            If bup = 8 Then
            
                'Debug.Print UserList(VictimaIndex).Stats.MinHP & "Antes"
                UserList(VictimaIndex).Stats.MinHP = UserList(VictimaIndex).Stats.MinHP + Porcentaje(UserList(VictimaIndex).Stats.MaxHP, 15)
                'Debug.Print UserList(VictimaIndex).Stats.MinHP & "Despues"
            
            If UserList(VictimaIndex).Stats.MinHP > UserList(VictimaIndex).Stats.MaxHP Then UserList(VictimaIndex).Stats.MinHP = UserList(VictimaIndex).Stats.MaxHP

            End If
            End If



    'RACIAL: ABISARIO
    If UserList(VictimaIndex).Stats.MinHP < 1 And UserList(VictimaIndex).raza = "Abisario" Then
        a = RandomNumber(1, 10)

        If a = 8 Then UserList(VictimaIndex).Stats.MinHP = 1

    End If

    If UserList(VictimaIndex).Stats.MinHP < UserList(VictimaIndex).Stats.MaxHP / 3 And UserList(VictimaIndex).raza = "Enano" Then
        'Call SendData2(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, 22, UserList( _
                                                                                   VictimaIndex).Char.CharIndex & "´" & Hechizos(42).FXgrh & "´" & Hechizos(25).loops)
        Call SendData(ToIndex, VictimaIndex, 0, "||¡¡¡¡¡ HAS ENTRADO EN BERSERKER !!!!!!!" & "´" & _
                                                FontTypeNames.FONTTYPE_INFO)
        Call SendData(ToPCArea, VictimaIndex, UserList(VictimaIndex).Pos.Map, "TW" & SND_IMPACTO_BERSERKER)


    End If

    If UserList(VictimaIndex).Stats.MinHP < 1 Then

        UserList(VictimaIndex).Stats.MinHP = 0
        Call ContarMuerte(VictimaIndex, AtacanteIndex)
        ' Para que las mascotas no sigan intentando luchar y
        ' comiencen a seguir al amo
        Dim J As Integer

        For J = 1 To MAXMASCOTAS

            If UserList(AtacanteIndex).MascotasIndex(J) > 0 Then
                If Npclist(UserList(AtacanteIndex).MascotasIndex(J)).Target = VictimaIndex Then Npclist(UserList( _
                                                                                                        AtacanteIndex).MascotasIndex(J)).Target = 0
                Call FollowAmo(UserList(AtacanteIndex).MascotasIndex(J))

            End If

        Next J

        Call ActStats(VictimaIndex, AtacanteIndex)

    End If

    'Controla el nivel del usuario
    Call CheckUserLevel(AtacanteIndex)
    Call senduserstatsbox(AtacanteIndex)

    Exit Sub
fallo:
    Call LogError("userdañouser " & Err.number & " D: " & Err.Description & " Atacante: " & UserList( _
                  AtacanteIndex).Name & " Defensor: " & UserList(VictimaIndex).Name)

End Sub

Sub UsuarioAtacadoPorUsuario(ByVal AttackerIndex As Integer, ByVal VictimIndex As Integer)

    On Error GoTo fallo

    'controla sala torneos
    'pluto:2.12 añade torneo2
    'If UserList(AttackerIndex).Faccion.ArmadaReal > 0 Then GoTo endp
    If MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "TORNEO" Then Exit Sub
    If MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "TORNEOGM" Then Exit Sub
    If MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "EVENTO" Then Exit Sub
    'controla castillos
    'pluto:2.4 añade goto endp

    'pluto:6.8 AÑADE CLAN
    If MapInfo(UserList(AttackerIndex).Pos.Map).Zona = "CLAN" Or MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = _
       "CASTILLO" Or UserList(AttackerIndex).Pos.Map = 185 Then GoTo endp
    'If UserList(AttackerIndex).pos.Map > 165 And UserList(AttackerIndex).pos.Map < 170 Then GoTo endp

    If UserList(AttackerIndex).GuildInfo.GuildName = "" Or UserList(VictimIndex).GuildInfo.GuildName = "" Then

        If Not Criminal(AttackerIndex) And Not Criminal(VictimIndex) Then
            Call VolverCriminal(AttackerIndex)

        End If

        If Not Criminal(VictimIndex) Then
            'Call AddtoVar(UserList(AttackerIndex).Reputacion.BandidoRep, vlASALTO, MAXREP)
        Else
            'Call AddtoVar(UserList(AttackerIndex).Reputacion.NobleRep, vlNoble, MAXREP)

        End If

    Else    'Tiene clan
        Set UserList(AttackerIndex).GuildRef = FetchGuild(UserList(AttackerIndex).GuildInfo.GuildName)

        If UserList(AttackerIndex).GuildRef Is Nothing Then GoTo endp
        If UserList(AttackerIndex).GuildRef.IsAllie(UserList(VictimIndex).GuildInfo.GuildName) Then

            If Not Criminal(AttackerIndex) And Not Criminal(VictimIndex) Then
                Call VolverCriminal(AttackerIndex)

            End If

            If Not Criminal(VictimIndex) Then
                'Call AddtoVar(UserList(AttackerIndex).Reputacion.BandidoRep, vlASALTO, MAXREP)
            Else
                'Call AddtoVar(UserList(AttackerIndex).Reputacion.NobleRep, vlNoble, MAXREP)

            End If

        Else

            If Not Criminal(VictimIndex) Then
                'Call AddtoVar(UserList(AttackerIndex).Reputacion.BandidoRep, vlASALTO, MAXREP)
            Else
                'Call AddtoVar(UserList(AttackerIndex).Reputacion.NobleRep, vlNoble, MAXREP)

            End If

            'Call GiveGuildPoints(1, AttackerIndex, False)

        End If

    End If

endp:
    Call AllMascotasAtacanUser(AttackerIndex, VictimIndex)
    Call AllMascotasAtacanUser(VictimIndex, AttackerIndex)

    Exit Sub
fallo:
    Call LogError("usuarioatacadoporusuario " & Err.number & " D: " & Err.Description)

End Sub

Sub AllMascotasAtacanUser(ByVal Victim As Integer, ByVal Maestro As Integer)

    On Error GoTo fallo

    'Reaccion de las mascotas
    Dim iCount As Integer

    For iCount = 1 To MAXMASCOTAS

        If UserList(Maestro).MascotasIndex(iCount) > 0 Then
            Npclist(UserList(Maestro).MascotasIndex(iCount)).flags.AttackedBy = UserList(Victim).Name
            Npclist(UserList(Maestro).MascotasIndex(iCount)).Movement = NPCDEFENSA
            Npclist(UserList(Maestro).MascotasIndex(iCount)).Hostile = 1

        End If

    Next iCount

    Exit Sub
fallo:
    Call LogError("allmascotasatacanuser " & Err.number & " D: " & Err.Description)

End Sub

Public Function PuedeAtacar(ByVal AttackerIndex As Integer, _
                            ByVal VictimIndex As Integer) As Boolean

    On Error GoTo fallo

    'quitar esto
    'PuedeAtacar = True
    'Exit Function
    'pluto:6.9
    'If UserList(VictimIndex).Pos.Map = 303 Then
    '  If UserList(VictimIndex).Pos.Y < 57 Then
    ' Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacar en esta zona." & "´" & FontTypeNames.FONTTYPE_info)
    'PuedeAtacar = False
    'Exit Function
    'End If
    'End If

    'pluto:6.2:Se asegura que la victima no es un GM y que no acaba de incorporarse
    If UserList(VictimIndex).flags.Privilegios >= 1 Or UserList(VictimIndex).flags.Incor = True Then
        Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacarle aún." & "´" & FontTypeNames.FONTTYPE_INFO)
        PuedeAtacar = False
        Exit Function

    End If

    If UserList(AttackerIndex).flags.Incor = True Then
        Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacar aún." & "´" & FontTypeNames.FONTTYPE_INFO)
        PuedeAtacar = False
        Exit Function

    End If

    If UserList(VictimIndex).flags.ParejaTorneo = AttackerIndex Then
        Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacar a tu pareja." & "´" & FontTypeNames.FONTTYPE_INFO)
        Exit Function

    End If

    'pluto:2.19---------------
    If haciendoBK = True Then
        Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacar durante un world save." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
        Exit Function

    End If

    '-----------------------
    '[Tite]Añado que no sean miembros de la misma party
    If UserList(AttackerIndex).flags.party = True And UserList(VictimIndex).flags.party = True Then
        If UserList(AttackerIndex).flags.partyNum = UserList(VictimIndex).flags.partyNum Then
            Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacar a un miembro de tu party." & "´" & _
                                                     FontTypeNames.FONTTYPE_INFO)
            PuedeAtacar = False
            Exit Function

        End If

    End If

    '[\Tite]

    'pluto:2.4
    'pluto:2.11
    If MapaSeguro = UserList(AttackerIndex).Pos.Map And UserList(AttackerIndex).flags.Privilegios = 0 Then
        PuedeAtacar = False
        Call SendData(ToIndex, AttackerIndex, 0, "||En este Mapa está prohibido atacar." & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
        Exit Function

    End If

    'pluto:6.0A
    'If MapInfo(UserList(VictimIndex).Pos.Map).Insegura = 1 And UserList(AttackerIndex).Faccion.ArmadaReal = 0 And UserList(AttackerIndex).Faccion.FuerzasCaos = 0 Then
    'PuedeAtacar = False
    ' Call SendData(ToIndex, AttackerIndex, 0, "||En este mapa sólo puedes atacar a miembros de armadas." & "´" & FontTypeNames.FONTTYPE_info)
    'Exit Function
    'End If

    'pluto:6.0A
    If UserList(AttackerIndex).flags.Hambre > 0 Or UserList(AttackerIndex).flags.Sed > 0 Then
        PuedeAtacar = False
        Call SendData(ToIndex, AttackerIndex, 0, "||Demasiado hambriento o sediento para poder atacar!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_INFO)
        Exit Function

    End If

    'pluto:2.12
    If UserList(AttackerIndex).Pos.Map = MapaTorneo2 And UserList(AttackerIndex).Torneo2 >= 10 Then
        PuedeAtacar = False
        Call SendData(ToIndex, AttackerIndex, 0, "||No puedes seguir luchando abandona el Mapa por el Teleport." & _
                                                 "´" & FontTypeNames.FONTTYPE_COMERCIO)
        Exit Function

    End If

    If UserList(AttackerIndex).Char.CharIndex = UserList(VictimIndex).Char.CharIndex Then
        PuedeAtacar = False
        Call SendData(ToIndex, AttackerIndex, 0, "||No te puedes atacar a ti mismo." & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)
        Exit Function

    End If

    If UserList(AttackerIndex).flags.Privilegios > 0 And UserList(VictimIndex).flags.Privilegios < 1 Then
        PuedeAtacar = True
        Exit Function

    End If

    'pluto:2.17
    If MapInfo(UserList(VictimIndex).Pos.Map).Terreno = "ALDEA" And EsNewbie(VictimIndex) Then
        PuedeAtacar = False
        Call SendData(ToIndex, AttackerIndex, 0, "Z9")
        Exit Function

    End If

    'pluto:2.19--------
    'If MapInfo(UserList(VictimIndex).Pos.Map).Terreno = "CONQUISTA" Then
    'If (UserList(VictimIndex).Faccion.ArmadaReal = UserList(AttackerIndex).Faccion.ArmadaReal) Or (UserList(VictimIndex).Faccion.FuerzasCaos = UserList(AttackerIndex).Faccion.FuerzasCaos) Then
    'PuedeAtacar = False
    'Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacar miembros de tu Armada." & FONTTYPENAMES.FONTTYPE_WARNING)

    'Exit Function
    'End If
    'End If
    '------------------
    If MapInfo(UserList(VictimIndex).Pos.Map).Pk = False Then

        'armadas atacan en ciudad
        If UserList(AttackerIndex).Faccion.ArmadaReal > 0 And Criminal(VictimIndex) And MapInfo(UserList( _
                                                                                                VictimIndex).Pos.Map).Dueño = 1 Then GoTo talu

        If UserList(AttackerIndex).Faccion.FuerzasCaos > 0 And Not Criminal(VictimIndex) And MapInfo(UserList( _
                                                                                                     VictimIndex).Pos.Map).Dueño = 2 Then GoTo talu
        Call SendData(ToIndex, AttackerIndex, 0, "||Esta es una zona segura." & "´" & FontTypeNames.FONTTYPE_WARNING)
        PuedeAtacar = False
        Exit Function

    End If

talu:

    'pluto:6.9 añado victima en trigger 4
    If MapData(UserList(AttackerIndex).Pos.Map, UserList(AttackerIndex).Pos.X, UserList(AttackerIndex).Pos.Y).trigger _
       = 4 Or MapData(UserList(VictimIndex).Pos.Map, UserList(VictimIndex).Pos.X, UserList( _
                                                                                  VictimIndex).Pos.Y).trigger = 4 Then
        Call SendData(ToIndex, AttackerIndex, 0, "||No podes pelear aqui." & "´" & FontTypeNames.FONTTYPE_WARNING)
        PuedeAtacar = False
        Exit Function

    End If
    

    'pluto:2.18 añade mapas nuevos castillos, añade torneo2
    If UserList(VictimIndex).Faccion.ArmadaReal = 1 And UserList(AttackerIndex).Faccion.ArmadaReal = 1 And UserList(AttackerIndex).flags.Seguro = True Then
    If MapInfo(UserList( _
    AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> _
    "CLANATACA" And UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> _
    mapa_castillo2 And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map _
    <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 And (UserList(AttackerIndex).Pos.Map < 268 _
    Or UserList(AttackerIndex).Pos.Map > 271) And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "EVENTO" _
    And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 Then
    
        Call SendData(ToIndex, AttackerIndex, 0, _
                      "||Los soldados de la alianza no pueden atacarse entre sí. Debes quitar el SEGURO para realizar esta acción, serás castigado por incumplir con las normas de la Alianza, también deberás disponer de 25.000 monedas de oro para pagar tu castigo por romper las normas" & "´" & _
                      FontTypeNames.FONTTYPE_WARNING)
        PuedeAtacar = False
        Exit Function
        
    End If
    End If
        
    If UserList(VictimIndex).Faccion.ArmadaReal = 1 And UserList(AttackerIndex).Faccion.ArmadaReal = 1 And UserList(AttackerIndex).flags.Seguro = False And UserList(AttackerIndex).Stats.GLD > 25000 And MapInfo(UserList( _
    AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> _
    "CLANATACA" And UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> _
    mapa_castillo2 And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map _
    <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 And (UserList(AttackerIndex).Pos.Map < 268 _
    Or UserList(AttackerIndex).Pos.Map > 271) And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "EVENTO" _
    And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 Then
    
        UserList(AttackerIndex).Faccion.Castigo = 10
        UserList(AttackerIndex).Faccion.ArmadaReal = 2
        Call SendData(ToIndex, AttackerIndex, 0, _
                      "||El castigo se aplica sobre tí, durante 10 minutos todos los usuario de tu facción podrán atacarte, y cada ves que mates un usuaio de tu facción perderás 25.000 monedas de oro." & "´" & _
                      FontTypeNames.FONTTYPE_WARNING)
                      
    ElseIf UserList(VictimIndex).Faccion.ArmadaReal = 1 And UserList(AttackerIndex).Faccion.SoyReal = 1 And UserList(AttackerIndex).flags.Seguro = False And MapInfo(UserList( _
    AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> _
    "CLANATACA" And UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> _
    mapa_castillo2 And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map _
    <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 And (UserList(AttackerIndex).Pos.Map < 268 _
    Or UserList(AttackerIndex).Pos.Map > 271) And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "EVENTO" _
    And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 And UserList(AttackerIndex).Stats.GLD < 25000 Then
    
        Call SendData(ToIndex, AttackerIndex, 0, _
                      "||No dispones de 25.000 monedas de oro para atacar a un usuario de tu misma facción." & "´" & _
                      FontTypeNames.FONTTYPE_WARNING)
    PuedeAtacar = False
    Exit Function
    
    End If
    


    
        'pluto:2.18 añade mapas nuevos castillos, añade torneo2
    If UserList(VictimIndex).Faccion.FuerzasCaos = 1 And UserList(AttackerIndex).Faccion.FuerzasCaos = 1 And UserList(AttackerIndex).flags.Seguro = True Then
    If MapInfo(UserList( _
    AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> _
    "CLANATACA" And UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> _
    mapa_castillo2 And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map _
    <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 And (UserList(AttackerIndex).Pos.Map < 268 _
    Or UserList(AttackerIndex).Pos.Map > 271) And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "EVENTO" _
    And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 Then
    
        Call SendData(ToIndex, AttackerIndex, 0, _
                      "||Los soldados de la Horda no pueden atacarse entre sí. Debes quitar el SEGURO para realizar esta acción, serás castigado por incumplir con las normas de la Horda, también deberás disponer de 25.000 monedas de oro para pagar tu castigo por romper las normas" & "´" & _
                      FontTypeNames.FONTTYPE_WARNING)
        PuedeAtacar = False
        Exit Function
        
    End If
    End If
        
    If UserList(VictimIndex).Faccion.FuerzasCaos = 1 And UserList(AttackerIndex).Faccion.FuerzasCaos = 1 And UserList(AttackerIndex).flags.Seguro = False And UserList(AttackerIndex).Stats.GLD > 25000 And MapInfo(UserList( _
    AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> _
    "CLANATACA" And UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> _
    mapa_castillo2 And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map _
    <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 And (UserList(AttackerIndex).Pos.Map < 268 _
    Or UserList(AttackerIndex).Pos.Map > 271) And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "EVENTO" _
    And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 Then
    
        UserList(AttackerIndex).Faccion.Castigo = 10
        UserList(AttackerIndex).Faccion.ArmadaReal = 2
        UserList(AttackerIndex).Faccion.FuerzasCaos = 0
    Call SendData(ToIndex, AttackerIndex, 0, _
                      "||El castigo se aplica sobre tí, durante 10 minutos todos los usuario de tu facción podrán atacarte, y cada ves que mates un usuaio de tu facción perderás 25.000 monedas de oro." & "´" & _
                      FontTypeNames.FONTTYPE_WARNING)
    ElseIf UserList(VictimIndex).Faccion.FuerzasCaos = 1 And UserList(AttackerIndex).Faccion.SoyCaos = 1 And UserList(AttackerIndex).flags.Seguro = False And MapInfo(UserList( _
    AttackerIndex).Pos.Map).Terreno <> "TORNEO" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> _
    "CLANATACA" And UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> _
    mapa_castillo2 And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map _
    <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 And (UserList(AttackerIndex).Pos.Map < 268 _
    Or UserList(AttackerIndex).Pos.Map > 271) And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "TORNEOGM" And MapInfo(UserList(AttackerIndex).Pos.Map).Terreno <> "EVENTO" _
    And UserList(AttackerIndex).Pos.Map <> 182 And UserList(AttackerIndex).Pos.Map <> 92 And UserList(AttackerIndex).Pos.Map <> 279 And UserList(AttackerIndex).Pos.Map <> 165 And UserList(AttackerIndex).Stats.GLD < 25000 Then
    
        Call SendData(ToIndex, AttackerIndex, 0, _
                      "||No dispones de 25.000 monedas de oro para atacar a un usuario de tu misma facción." & "´" & _
                      FontTypeNames.FONTTYPE_WARNING)
    PuedeAtacar = False
    Exit Function
    
    End If


    'legion
    '[MerLiNz]
    'pluto:2.12 añade torneo2
    'If Not Criminal(VictimIndex) And UserList(AttackerIndex).Faccion.ArmadaReal = 2 And UserList(AttackerIndex).Pos.Map <> MAPATORNEO And UserList(AttackerIndex).Pos.Map <> MapaTorneo2 And _
     'UserList(AttackerIndex).Pos.Map <> mapa_castillo1 And UserList(AttackerIndex).Pos.Map <> mapa_castillo2 _
     'And UserList(AttackerIndex).Pos.Map <> mapa_castillo3 And UserList(AttackerIndex).Pos.Map <> mapa_castillo4 And UserList(AttackerIndex).Pos.Map <> 185 Then
    '[\END]
    '   Call SendData(ToIndex, AttackerIndex, 0, "||Los soldados de la Legión tienen prohibido atacar ciudadanos." & FONTTYPENAMES.FONTTYPE_WARNING)
    '  PuedeAtacar = False
    ' Exit Function
    'End If

    If UserList(VictimIndex).flags.Muerto = 1 Then
        SendData ToIndex, AttackerIndex, 0, "||No podes atacar a un espiritu" & "´" & FontTypeNames.FONTTYPE_INFO
        PuedeAtacar = False
        Exit Function

    End If

    If UserList(AttackerIndex).flags.Muerto = 1 Then
        SendData ToIndex, AttackerIndex, 0, "L3"
        PuedeAtacar = False
        Exit Function

    End If

    'pluto:2.18 añade castillo
    If UserList(AttackerIndex).GuildInfo.GuildName = "" Or UserList(VictimIndex).GuildInfo.GuildName = "" Then GoTo okp

    'pluto:2.12 añade torneo2
    'If MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "TORNEO" Or MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "CIUDAD" Then GoTo okp  'Or UserList(AttackerIndex).Pos.Map = mapa_castillo1 Or UserList(AttackerIndex).Pos.Map = mapa_castillo2 _Or MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "CONQUISTA" Or UserList(AttackerIndex).Pos.Map Or mapa_castillo3 Or UserList(AttackerIndex).Pos.Map <> mapa_castillo4 Then GoTo okp
    'pluto:6.8

    If MapInfo(UserList(VictimIndex).Pos.Map).Terreno = "CLANATACA" Then
        PuedeAtacar = True
        Exit Function

    End If

    'pluto:6.8 quita ciudad para el 112
    If MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "TORNEO" Then GoTo okp  'Or UserList(AttackerIndex).Pos.Map = mapa_castillo1 Or UserList(AttackerIndex).Pos.Map = mapa_castillo2 _Or MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "CONQUISTA" Or UserList(AttackerIndex).Pos.Map Or mapa_castillo3 Or UserList(AttackerIndex).Pos.Map <> mapa_castillo4 Then GoTo okp

    If MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "EVENTO" Then GoTo okp
    
    If MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = "TORNEOGM" Then GoTo okp

    If UserList(AttackerIndex).GuildInfo.GuildName = UserList(VictimIndex).GuildInfo.GuildName Then
        PuedeAtacar = False
        Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacar a la gente de tu clan!!" & "´" & _
                                                 FontTypeNames.FONTTYPE_FIGHT)
        Exit Function

    End If

    Set UserList(AttackerIndex).GuildRef = FetchGuild(UserList(AttackerIndex).GuildInfo.GuildName)

    If Not UserList(AttackerIndex).GuildRef Is Nothing Then
        If UserList(AttackerIndex).GuildRef.IsAllie(UserList(VictimIndex).GuildInfo.GuildName) Then
            PuedeAtacar = False
            Call SendData(ToIndex, AttackerIndex, 0, "||No puedes atacar a gente de clanes aliados :)" & "´" & _
                                                     FontTypeNames.FONTTYPE_FIGHT)
            Exit Function

        End If

    End If

okp:

    'pluto:2.12 añade torneo2
    'If UserList(AttackerIndex).flags.Seguro Then
        'If Not Criminal(VictimIndex) And Not Criminal(AttackerIndex) And Not MapInfo(UserList( _
                                                                                     AttackerIndex).Pos.Map).Zona = "CASTILLO" And Not MapInfo(UserList(AttackerIndex).Pos.Map).Terreno = _
                                                                                     "TORNEO" Then
            'Call SendData(ToIndex, AttackerIndex, 0, _
                          "||No podes atacar ciudadanos, para hacerlo debes desactivar el seguro." & "´" & _
                          FontTypeNames.FONTTYPE_GUILD)
           ' Exit Function

        'End If

    'End If

    PuedeAtacar = True
    Exit Function
fallo:
    Call LogError("puedeatacar " & Err.number & " D: " & Err.Description)

End Function

