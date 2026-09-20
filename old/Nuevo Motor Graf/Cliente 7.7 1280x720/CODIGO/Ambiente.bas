Attribute VB_Name = "Ambiente"
Option Explicit
 
' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
' This program is free software; you can redistribute it and/or modify
' it under the terms of the Affero General Public License;
' either version 1 of the License, or any later version.
'
' This program is distributed in the hope that it will be useful,
' but WITHOUT ANY WARRANTY; without even the implied warranty of
' MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
' Affero General Public License for more details.
'
' You should have received a copy of the Affero General Public License
' along with this program; if not, you can find it at http://www.affero.org/oagpl.html
' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Private Type RGB

    r As Long
    g As Long
    b As Long

End Type

Private ColorActual     As RGB
Private ColorFinal      As RGB
 
Public Fade             As Boolean
Public AmbientLastCheck As Long
 
Public Sub Ambient_Get(ByRef Color As RGB)
 
    Color = ColorActual
 
End Sub
 
Public Sub Ambient_Check()
 
    Dim Hora As Long, Minutos As Long
 
    Hora = Hour(Time$)
    Minutos = Minute(Time$)
 
    If Hora >= 6 And Hora < 8 Then
        'Amanecer
        Call Ambient_SetFinal(193, 176, 121)
    ElseIf Hora >= 8 And Hora < 16 Then
        'Dia
        Call Ambient_SetFinal(255, 255, 255)
    ElseIf Hora >= 16 And (Hora < 19 Or (Hora = 19 And Minutos < 30)) Then
        'Tarde
        Call Ambient_SetFinal(215, 213, 215)
    ElseIf (Hora = 19 And Minutos >= 30 And Minutos < 35) Then
        'Anochecer
        Call Ambient_SetFinal(187, 189, 192)
    ElseIf (((Hora > 19) Or (Hora = 19 And Minutos >= 35)) And Hora < 23) Or Hora >= 3 And Hora < 6 Then
        'Noche
        Call Ambient_SetFinal(169, 169, 197)
    ElseIf (Hora = 23 Or Hora = 0) Or (Hora > 0 And Hora < 3) Then
        'Noche mas oscura
        Call Ambient_SetFinal(159, 155, 197)

    End If
 
End Sub
 
Public Sub Ambient_Fade()
 
    Call CalculateRGB(ColorFinal.r, ColorFinal.g, ColorFinal.b)
    Fade = Not (ColorFinal.r = ColorActual.r And ColorFinal.g = ColorActual.g And ColorFinal.b = ColorActual.b)
 
    Dim x As Long, y As Long, Color As Long
    Color = ARGB(ColorActual.r, ColorActual.g, ColorActual.b, 255)
 
    For x = 1 To 100
        For y = 1 To 100
            MapData(x, y).Color = Color
        Next y
    Next x
  
End Sub
 
Public Sub Ambient_SetActual(ByVal r As Byte, ByVal g As Byte, ByVal b As Byte)
 
    ColorActual.r = r
    ColorActual.g = g
    ColorActual.b = b
 
End Sub
 
Private Sub Ambient_SetFinal(ByVal r As Byte, ByVal g As Byte, ByVal b As Byte)
 
    ColorFinal.r = r
    ColorFinal.g = g
    ColorFinal.b = b
    Fade = Not (ColorFinal.r = ColorActual.r And ColorFinal.g = ColorActual.g And ColorFinal.b = ColorActual.b)
 
End Sub
 
Private Sub CalculateRGB(ByVal r As Byte, ByVal g As Byte, ByVal b As Byte)
 
    With ColorActual
 
        If .r < r Then
            .r = .r + 1
        ElseIf .r > r Then
            .r = .r - 1

        End If
 
        If .b < b Then
            .b = .b + 1
        ElseIf .b > b Then
            .b = .b - 1

        End If
 
        If .g < g Then
            .g = .g + 1
        ElseIf .g > g Then
            .g = .g - 1

        End If
 
    End With
 
End Sub

