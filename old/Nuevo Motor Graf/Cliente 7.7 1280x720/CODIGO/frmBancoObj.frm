VERSION 5.00
Begin VB.Form frmBancoObj 
   BackColor       =   &H00000000&
   BorderStyle     =   0  'None
   ClientHeight    =   7290
   ClientLeft      =   2460
   ClientTop       =   285
   ClientWidth     =   6930
   ControlBox      =   0   'False
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "frmBancoObj.frx":0000
   ScaleHeight     =   486
   ScaleMode       =   3  'Pixel
   ScaleWidth      =   462
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.TextBox cantidad 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   360
      Left            =   3000
      TabIndex        =   6
      Text            =   "1"
      Top             =   5985
      Width           =   840
   End
   Begin VB.PictureBox Picture1 
      AutoRedraw      =   -1  'True
      BackColor       =   &H00000000&
      BorderStyle     =   0  'None
      FillStyle       =   0  'Solid
      Height          =   600
      Left            =   750
      ScaleHeight     =   40
      ScaleMode       =   3  'Pixel
      ScaleWidth      =   37
      TabIndex        =   2
      Top             =   840
      Width           =   555
   End
   Begin VB.ListBox List1 
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   4230
      Index           =   1
      Left            =   3600
      MouseIcon       =   "frmBancoObj.frx":126B7
      MousePointer    =   99  'Custom
      TabIndex        =   1
      Top             =   1560
      Width           =   3090
   End
   Begin VB.ListBox List1 
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   4230
      Index           =   0
      Left            =   240
      MouseIcon       =   "frmBancoObj.frx":13381
      MousePointer    =   99  'Custom
      TabIndex        =   0
      Top             =   1560
      Width           =   3090
   End
   Begin VB.Image Image1 
      Height          =   495
      Index           =   1
      Left            =   3840
      MouseIcon       =   "frmBancoObj.frx":1404B
      MousePointer    =   99  'Custom
      Top             =   5880
      Width           =   2415
   End
   Begin VB.Image Image1 
      Height          =   495
      Index           =   0
      Left            =   600
      MouseIcon       =   "frmBancoObj.frx":14D15
      MousePointer    =   99  'Custom
      Top             =   5880
      Width           =   2415
   End
   Begin VB.Image Image2 
      Appearance      =   0  'Flat
      Height          =   375
      Left            =   2520
      MouseIcon       =   "frmBancoObj.frx":159DF
      MousePointer    =   99  'Custom
      Top             =   6600
      Width           =   1815
   End
   Begin VB.Label Label2 
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      Caption         =   "Cantidad"
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   210
      Left            =   3000
      TabIndex        =   7
      Top             =   5760
      Width           =   840
   End
   Begin VB.Label Label1 
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   210
      Index           =   3
      Left            =   3990
      TabIndex        =   5
      Top             =   1215
      Visible         =   0   'False
      Width           =   105
   End
   Begin VB.Label Label1 
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   330
      Index           =   4
      Left            =   3990
      TabIndex        =   4
      Top             =   840
      Visible         =   0   'False
      Width           =   105
   End
   Begin VB.Label Label1 
      AutoSize        =   -1  'True
      BackStyle       =   0  'Transparent
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   210
      Index           =   2
      Left            =   2730
      TabIndex        =   3
      Top             =   1170
      Width           =   105
   End
End
Attribute VB_Name = "frmBancoObj"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

'<-------------------------NUEVO-------------------------->
'<-------------------------NUEVO-------------------------->
'<-------------------------NUEVO-------------------------->
Public LastIndex1 As Integer
Public LastIndex2 As Integer

Private DrawObj As clsGraphicPicture

Private Sub cantidad_Change()

    If Val(cantidad.Text) < 0 Then
        cantidad.Text = 1

    End If

    If Val(cantidad.Text) > MAX_INVENTORY_OBJS Then
        cantidad.Text = 1

    End If

End Sub

Private Sub cantidad_KeyPress(KeyAscii As Integer)

    If (KeyAscii <> 8) Then

        If (KeyAscii <> 6) And (KeyAscii < 48 Or KeyAscii > 57) Then
            KeyAscii = 0

        End If

    End If

End Sub

Private Sub Form_Deactivate()

    Me.SetFocus

End Sub

Private Sub Form_Load()

    'Cargamos la interfase
    Me.Picture = cLoadPicture(DirInterfaces & "comerciar.jpg")
    
    Set DrawObj = New clsGraphicPicture
    
    DrawObj.Initialize Picture1, 0, 0, 0
    
End Sub

Private Sub Form_Unload(Cancel As Integer)

    DrawObj.Class_Terminate

End Sub

Private Sub Image1_Click(Index As Integer)

    Call Audio.PlayWave(SND_CLICK)

    If List1(Index).List(List1(Index).ListIndex) = "Nada" Or List1(Index).ListIndex < 0 Then Exit Sub

    Select Case Index

        Case 0
            frmBancoObj.List1(0).SetFocus
            LastIndex1 = List1(0).ListIndex

            SendData ("RETI" & "," & List1(0).ListIndex + 1 & "," & cantidad.Text)

        Case 1
            LastIndex2 = List1(1).ListIndex

            If Inventario.Equipped(List1(1).ListIndex + 1) = 0 Then
                SendData ("DEPO" & "," & List1(1).ListIndex + 1 & "," & cantidad.Text)
            Else
                AddtoRichTextBox frmMain.RecTxt, "No podes depositar el item porque lo estas usando.", 2, 51, 223, 1, 1
                Exit Sub

            End If

    End Select

    List1(0).Clear
    List1(1).Clear
    NPCInvDim = 0

End Sub

Private Sub Image2_Click()

    SendData ("FINBAN")

End Sub

Private Sub Form_MouseUp(Button As Integer, Shift As Integer, x As Single, y As Single)

    If Button = vbRightButton Then
    Unload Me
    
    End If
    SendData ("FINBAN")

End Sub

Private Sub List1_Click(Index As Integer)

    Dim Indice As Integer
    
    Select Case Index

        Case 0
            Indice = List1(0).ListIndex + 1
            Label1(2).Caption = UserBancoInventory(Indice).Amount

            Select Case UserBancoInventory(Indice).ObjType

                Case 2
                    Label1(3).Caption = "Max Golpe:" & UserBancoInventory(Indice).MaxHit
                    Label1(4).Caption = "Min Golpe:" & UserBancoInventory(Indice).MinHit
                    Label1(3).Visible = True
                    Label1(4).Visible = True

                Case 3
                    Label1(3).Visible = False
                    Label1(4).Caption = "Defensa:" & Inventario.DefMin(Indice) & "/" & Inventario.DefMax(Indice)
                    'Label1(4).Caption = "Defensa Cuerpo:" & UserBancoInventory(Indice).Defcuerpo + 5 & vbCrLf & "Defensa Mágica:" & _
                     UserBancoInventory(Indice).Defmagica
                    Label1(4).Visible = True

            End Select

            'Call DrawGrhtoHdc(Picture1.hwnd, UserBancoInventory(Indice).GrhIndex, 0, 0)
            DrawObj.setGrhIndex = UserBancoInventory(Indice).GrhIndex

        Case 1
            Indice = List1(1).ListIndex + 1
            Label1(2).Caption = Inventario.Amount(Indice)

            Select Case Inventario.ObjType(Indice)

                Case 2
                    Label1(3).Caption = "Max Golpe:" & Inventario.MaxHit(Indice)
                    Label1(4).Caption = "Min Golpe:" & Inventario.MinHit(Indice)
                    Label1(3).Visible = True
                    Label1(4).Visible = True

                Case 3
                    Label1(3).Visible = False
                    Label1(4).Caption = "Defensa:" & Inventario.DefMin(Indice) & "/" & Inventario.DefMax(Indice)
                    'Label1(4).Caption = "Defensa Cuerpo:" & UserBancoInventory(Indice).Defcuerpo + 5 & vbCrLf & "Defensa Mágica:" & _
                     UserBancoInventory(Indice).Defmagica
                    Label1(4).Visible = True

            End Select

            'Call DrawGrhtoHdc(Picture1.hwnd, Inventario.GrhIndex(Indice), 0, 0)
            DrawObj.setGrhIndex = Inventario.GrhIndex(Indice)

    End Select

End Sub

