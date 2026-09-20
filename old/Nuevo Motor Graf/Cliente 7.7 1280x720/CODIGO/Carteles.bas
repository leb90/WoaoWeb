Attribute VB_Name = "Carteles"
Option Explicit
Private Const XPosCartel = 400
Private Const YPosCartel = 306
Private Const MAXLONG = 40

'Carteles
Public Cartel              As Boolean
Private Leyenda             As String
Private LeyendaFormateada() As String
Private textura             As Integer

Sub InitCartel(Ley As String, Grh As Integer)

    If Not Cartel Then
        Leyenda = Ley
        textura = Grh
        Cartel = True
        ReDim LeyendaFormateada(0 To (Len(Ley) \ (MAXLONG \ 2)))

        Dim i As Integer, k As Integer, anti As Integer
        anti = 1
        k = 0
        i = 0
        Call DarFormato(Leyenda, i, k, anti)
        i = 0

        Do While LenB(LeyendaFormateada(i)) <> 0 And i < UBound(LeyendaFormateada)

            i = i + 1
        Loop
        ReDim Preserve LeyendaFormateada(0 To i)
    Else
        Exit Sub

    End If

End Sub

Private Function DarFormato(s As String, i As Integer, k As Integer, anti As Integer)

    If anti + i <= Len(s) + 1 Then

        If ((i >= MAXLONG) And mid$(s, anti + i, 1) = " ") Or (anti + i = Len(s)) Then
            LeyendaFormateada(k) = mid$(s, anti, i + 1)
            k = k + 1
            anti = anti + i + 1
            i = 0
        Else
            i = i + 1

        End If

        Call DarFormato(s, i, k, anti)

    End If

End Function

Sub DibujarCartel()

    If Not Cartel Then Exit Sub
    Call DrawGrhToIndex(textura, XPosCartel, YPosCartel, 0#, 1, COLORS.White)
    Dim j As Long, Desp As Integer

    For j = 0 To UBound(LeyendaFormateada)
        wGl_Draw_Text 0, 12, XPosCartel + 20, YPosCartel + Desp - 100, COLORS.White, FONT_ALIGNMENT_CENTER, LeyendaFormateada(j)
        Desp = Desp + 13
    Next j

End Sub

