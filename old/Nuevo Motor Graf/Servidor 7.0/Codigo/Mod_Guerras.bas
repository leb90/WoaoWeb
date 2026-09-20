Attribute VB_Name = "Mod_Guerras"
Option Explicit

'******************************************************************************
'Black And White AO v0.1.2
'Mod_Guerras.bas
'******************************************************************************
'This program is free software; you can redistribute it and/or modify
'it under the terms of the GNU General Public License as published by
'the Free Software Foundation; either version 2 of the License, or
'any later version.
'This program is distributed in the hope that it will be useful,
'but WITHOUT ANY WARRANTY; without even the implied warranty of
'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
'GNU General Public License for more details.
'You should have received a copy of the GNU General Public License
'along with this program; if not, write to the Free Software
'Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
'
'Black And White AO is based on Argentum Online v0.11.5.
'Argentum Online is based on Baronsoft's VB6 Online RPG
'
'You can contact the original creator of ORE at [URL='mailto:aaron@baronsoft.com']aaron@baronsoft.com[/URL]
'for more information about ORE please visit [URL='http://www.baronsoft.com/']http://www.baronsoft.com/[/URL]
'
'You can contact the original creator of Argentum Online at [URL='mailto:morgolock@speedy.com.ar']morgolock@speedy.com.ar[/URL]
'for more information about Argentum Online please visit [URL='http://ao.alkon.com.ar/']http://ao.alkon.com.ar/[/URL]
'
'You can contact the programmer or a Black And White AO at [URL='mailto:EzequielJuarez@live.com.ar']EzequielJuarez@live.com.ar[/URL]
'for more information about Black And White AO please visit [URL='http://bwao.07x.net/']http://bwao.07x.net/[/URL]
'******************************************************************************

 
Public HayGuerra As Boolean 'Temporal: Hay Guerra o No?
Public CiudadGuerra As Integer 'Temporal: En que ciudad es la Guerra?
Public TiempoGuerra As Integer 'Temporal: Tiempo Transcurrido
Public GuerrasAutomaticas As Boolean 'Temporal: Guerras Automaticas
Private PosicionNPC As WorldPos 'Temporal: Posicion del NPC
Private NPCGuerra As Integer 'Temporal: NPC Usado en Guerra
 
'Facccion Real:
Public Const NPC1 As Integer = 365 'NPC de La Faccion Real
Public Const MapaGuerra1 As Integer = 204 'Mapa de la Faccion Real
Private Const MapaGuerra1X As Byte = 54 'X del Mapa de la Faccion Real
Private Const MapaGuerra1Y As Byte = 45 'Y del Mapa de la Faccion Caos
 
'Faccion Caos:
Public Const NPC2 As Integer = 366 'NPC de La Faccion Caos
Public Const MapaGuerra2 As Integer = 203 'Mapa de la Faccion Caos
Private Const MapaGuerra2X As Byte = 54 'X del Mapa de la Faccion Real
Private Const MapaGuerra2Y As Byte = 45 'Y del Mapa de la Faccion Caos
 
Public Const TiempoEntreGuerra As Byte = 120 'Duración de entre una Guerra y otra (Minutos)
Public Const DuracionGuerra As Byte = 10 'Duración de Guerra (Minutos)
 
Private Const OroRecompenza As Long = 30000 'Oro de Recompenz
Private Const QuestRecompenza As Integer = 80
 
'Private Const FONTGUERRA = FontTypeNames.FONTTYPE_GUERRA
 
 
Public Sub IniciarGuerra(ByVal Userindex As Integer)
    If Userindex <> 0 Then
        If HayGuerra Then
            Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "Ya hay una Guerra Actualmente.")
            Exit Sub
        End If
    End If
    
    HayGuerra = True
    TiempoGuerra = 0
    CantHordas = 0
    CantAlis = 0
 
    CiudadGuerra = RandomNumber(1, 2)
        Select Case CiudadGuerra
            Case 1 'Mapa de la Faccion Real
                MapInfo(MapaGuerra1).Pk = True
                    With PosicionNPC
                        .Map = MapaGuerra1
                        .X = MapaGuerra1X
                        .Y = MapaGuerra1Y
                    End With
                SpawnNpc NPC2, PosicionNPC, True, False
                CiudadGuerra = MapaGuerra1
                NPCGuerra = NPC2
                
            Case 2 'Mapa de la Faccion Caos
                MapInfo(MapaGuerra2).Pk = True
                    NPCGuerra = NPC1
                    With PosicionNPC
                        .Map = MapaGuerra2
                        .X = MapaGuerra2X
                        .Y = MapaGuerra2Y
                    End With
                SpawnNpc NPC1, PosicionNPC, True, False
                CiudadGuerra = MapaGuerra2
                NPCGuerra = NPC1
        End Select
        
    'Call SendData(ToAll, 0, 0, "||La Guerra ha Comenzado, Para participar envia /GUERRA" & "." & FontTypeNames.FONTTYPE_GUERRA)
    Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "¡La Guerra ha Comenzado, Para participar envia /GUERRA!")
 
Exit Sub
End Sub
 
Public Sub TerminaGuerra(ByVal FaccionGanadora As String, MurioNPC As Boolean)
Dim UI As Integer, X As Integer, Y As Integer
 
    If FaccionGanadora = "Real" Then
        Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "La Guerra ha terminado, La facción Ganadora es la Alianza, Los miembros de esta faccion reciben a cambio " & OroRecompenza & " Monedas de oro y " & QuestRecompenza & " Puntos Quest")
        Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "El dominio del templo pasa a manos de la Alianza /TEMPLO para ingresar.")
        Templo = 1
    ElseIf FaccionGanadora = "Caos" Then
        Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "La Guerra ha terminado, La facción Ganadora es la Horda, Los miembros de esta faccion reciben a cambio " & OroRecompenza & " Monedas de oro y" & QuestRecompenza & " Puntos Quest")
        Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "El dominio del templo pasa a manos de la Horda /TEMPLO para ingresar.")
        Templo = 2
    End If
    
    
 
    For UI = 1 To NumUsers
        If UserList(UI).Pos.Map = 203 Or UserList(UI).Pos.Map = 204 Then
        Call WarpUserChar(UI, 34, 50, 50, True)
            If FaccionGanadora = "Caos" And Criminal(UI) Then
                    UserList(UI).Stats.GLD = UserList(UI).Stats.GLD + OroRecompenza
                    UserList(UI).Stats.Puntos = UserList(UI).Stats.Puntos + QuestRecompenza
                    senduserstatsbox UI
                    
            Dim PuntosC As Integer
            PuntosC = UserList(UI).Stats.Puntos
            Call SendData(ToIndex, UI, 0, "J5" & PuntosC)
            End If
            If FaccionGanadora = "Real" And Not Criminal(UI) Then
                    UserList(UI).Stats.GLD = UserList(UI).Stats.GLD + OroRecompenza
                    UserList(UI).Stats.Puntos = UserList(UI).Stats.Puntos + QuestRecompenza
                    senduserstatsbox UI
            PuntosC = UserList(UI).Stats.Puntos
            Call SendData(ToIndex, UI, 0, "J5" & PuntosC)
            End If
            UserList(UI).flags.Guerra = False
        End If
    Next UI
    
    If Not MurioNPC Then
        For Y = 1 To 100
            For X = 1 To 100
                If MapData(CiudadGuerra, X, Y).NpcIndex > 0 Then
                    If Npclist(MapData(CiudadGuerra, X, Y).NpcIndex).numero = NPCGuerra Then
                        Call QuitarNPC(MapData(CiudadGuerra, X, Y).NpcIndex)
                    End If
                End If
            Next X
        Next Y
    End If
    
    Call SendData(ToAll, 0, 0, "|G0")
    CantHordas = 0
    CantAlis = 0
    
    MapInfo(CiudadGuerra).Pk = True
    HayGuerra = False
    TiempoGuerra = 0
    CantHordas = 0
    CantAlis = 0
Exit Sub
End Sub

 
Public Sub TimeGuerra()
TiempoGuerra = TiempoGuerra + 1

    'Dim TimeGuerra As Integer
    TimeGuerraX = TiempoEntreGuerra - TiempoGuerra
    
    If TimeGuerraX > 0 Then
    Call SendData(ToAll, 0, 0, "J9" & TimeGuerraX)
    Else
    Call SendData(ToAll, 0, 0, "J9" & 0)
    End If
 
    If Not HayGuerra And GuerrasAutomaticas Then
    
        If TiempoEntreGuerra - TiempoGuerra = 5 Or TiempoEntreGuerra - TiempoGuerra = 4 Or TiempoEntreGuerra - TiempoGuerra = 3 Or TiempoEntreGuerra - TiempoGuerra = 2 Or TiempoEntreGuerra - TiempoGuerra = 1 Then
            Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "Los Miembros de la Alianza y la Horda Pelearan una Guerra en " & TiempoEntreGuerra - TiempoGuerra & " Minutos, Equipense y preparense para defender a su Reino! Grandes Riquezas les esperan a los Sobrevivientes Victoriosos.")
        End If
        If val(TiempoGuerra) = TiempoEntreGuerra Then
            IniciarGuerra 0
            Exit Sub
        End If
    End If
    
    If HayGuerra Then
        'Debug.Print (DuracionGuerra - TiempoGuerra)
        If (DuracionGuerra - TiempoGuerra) < 8 And (CantHordas = 0 Or CantAlis = 0) Then
        EmpatarGuerra 0
        Exit Sub
        End If
        If val(TiempoGuerra) = DuracionGuerra Then
            If CiudadGuerra = MapaGuerra1 Then
                TerminaGuerra "Caos", False
            Else
                TerminaGuerra "Real", False
            End If
        Else
            Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "Quedan " & (DuracionGuerra - TiempoGuerra) & " Minutos de Guerra. Para defender a tu Reino Envia /Guerra.")
        End If
    End If
Exit Sub
End Sub
 
Public Sub EntrarGuerra(ByVal Userindex As Integer)
    If Not HayGuerra Then
        Call SendData(ToIndex, Userindex, 0, "|/Guerra Faccionaria" & "> " & "No Hay Ninguna Guerra Actualmente.")
        Exit Sub
    End If
        
    If UserList(Userindex).flags.Guerra = True Then
        Call SendData(ToIndex, Userindex, 0, "|/Guerra Faccionaria" & "> " & "Ya estas participando de la Guerra.")
        Exit Sub
    End If
    
    Dim DifHorda As Integer
    Dim DifAli As Integer
    
    DifHorda = CantHordas - CantAlis
    DifAli = CantAlis - CantHordas
    
    If UserList(Userindex).Faccion.FuerzasCaos = 1 And DifHorda > 0 Then
    Call SendData(ToIndex, Userindex, 0, "|/Guerra Faccionaria" & "> " & "Vuelve a intentar entrar en unos instantes, son demasiados hordas ya, deberían entrar algunos alianzas màs.")
    
    Exit Sub
    End If
    
    If UserList(Userindex).Faccion.ArmadaReal = 1 And DifAli > 0 Then
    Call SendData(ToIndex, Userindex, 0, "|/Guerra Faccionaria" & "> " & "Vuelve a intentar entrar en unos instantes, son demasiados Alianzas ya, deberían entrar algunos Hordas màs.")
    
    Exit Sub
    End If
    
 
    If CiudadGuerra = MapaGuerra1 Then
        If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
        WarpUserChar Userindex, MapaGuerra1, 77, 20, True
        CantHordas = CantHordas + 1
        End If
        If UserList(Userindex).Faccion.ArmadaReal = 1 Then
        WarpUserChar Userindex, MapaGuerra1, 45, 88, True
        CantAlis = CantAlis + 1
        End If
    ElseIf CiudadGuerra = MapaGuerra2 Then
        If UserList(Userindex).Faccion.ArmadaReal = 1 Then
            WarpUserChar Userindex, MapaGuerra2, 77, 20, True
            CantAlis = CantAlis + 1
        End If
        If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
            WarpUserChar Userindex, MapaGuerra2, 45, 88, True
            CantHordas = CantHordas + 1
        End If
        
    End If
    
    Call SendData(ToIndex, Userindex, 0, "|/Guerra Faccionaria" & "> " & "La Guerra ha Comenzado para ti, Defiende a tu faccion para recibir una recompenza.")
    Call SendData(ToIndex, Userindex, 0, "|G1")
    UserList(Userindex).flags.Guerra = True
Exit Sub
End Sub
 
Public Sub GuerrasAuto(ByVal Userindex As Integer, OnOff As Integer)
    If OnOff = 1 Then
        Call SendData(ToIndex, Userindex, 0, "|/Guerra Faccionaria" & "> " & "Las Guerras Automaticas han sido Ativadas.")
        GuerrasAutomaticas = True
    Else
        Call SendData(ToIndex, Userindex, 0, "|/Guerra Faccionaria" & "> " & "Las Guerras Automaticas han sido Desativadas.")
        GuerrasAutomaticas = False
    End If
Exit Sub
End Sub
 
Public Sub EmpatarGuerra(ByVal Userindex As Integer)
Dim UI As Integer, X As Integer, Y As Integer
 
    Call SendData(ToAll, 0, 0, "|/Guerra Faccionaria" & "> " & "La Guerra ha terminado, Ninguna Facción resulto victoriosa.")
 
    For UI = 1 To NumUsers
    If UserList(UI).flags.Guerra = True Then
    Call WarpUserChar(UI, 34, 50, 50, True)
    End If
    
            UserList(UI).flags.Guerra = False
    Next UI
    For Y = 1 To 100
        For X = 1 To 100
            If MapData(CiudadGuerra, X, Y).NpcIndex > 0 Then
                If Npclist(MapData(CiudadGuerra, X, Y).NpcIndex).numero = NPCGuerra Then
                    Call QuitarNPC(MapData(CiudadGuerra, X, Y).NpcIndex)
                End If
            End If
        Next X
    Next Y
    Call SendData(ToAll, 0, 0, "|G0")
    MapInfo(CiudadGuerra).Pk = True
    HayGuerra = False
    TiempoGuerra = 0
    CantHordas = 0
    CantAlis = 0
    Templo = 0
Exit Sub
End Sub
