VERSION 5.00
Begin VB.Form frmMiniMap 
   BorderStyle     =   0  'None
   Caption         =   "Form1"
   ClientHeight    =   1500
   ClientLeft      =   240
   ClientTop       =   6705
   ClientWidth     =   1500
   LinkTopic       =   "Form1"
   ScaleHeight     =   100
   ScaleMode       =   3  'Pixel
   ScaleWidth      =   100
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.PictureBox MiniMap 
      BorderStyle     =   0  'None
      Height          =   1500
      Left            =   0
      ScaleHeight     =   100
      ScaleMode       =   3  'Pixel
      ScaleWidth      =   100
      TabIndex        =   0
      Top             =   0
      Width           =   1500
      Begin VB.Timer Timer1 
         Enabled         =   0   'False
         Interval        =   50
         Left            =   120
         Top             =   120
      End
      Begin VB.Shape UserPosX 
         BorderColor     =   &H000000FF&
         FillColor       =   &H000000FF&
         FillStyle       =   0  'Solid
         Height          =   75
         Left            =   750
         Shape           =   3  'Circle
         Top             =   750
         Width           =   75
      End
   End
End
Attribute VB_Name = "frmMiniMap"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub Form_Load()

    Timer1.Enabled = True

End Sub

Private Sub Form_Unload(Cancel As Integer)

    Timer1.Enabled = False

End Sub

Private Sub Timer1_Timer()
 
    Me.UserPosX.Left = UserPos.x
    Me.UserPosX.Top = UserPos.y
 
End Sub
