VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "clsGraphicPicture"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'GDI->WGL
Private Declare Function PostMessage Lib "User32" Alias "PostMessageA" (ByVal hWnd As Long, _
                                                                        ByVal wMsg As Long, _
                                                                        ByVal wParam As Long, _
                                                                        ByRef lParam As Any) As Long
Private WithEvents MapWindow As PictureBox
Attribute MapWindow.VB_VarHelpID = -1
Private Device               As Integer
Private Color                As Long
Private GrhIndex             As Long
Private PosX                 As Long
Private PosY                 As Long

Public Sub Class_Terminate()

    Call wGL_Graphic.Destroy_Device(Device)

End Sub

Public Property Let setColor(ByVal RGBColor As Long)

    Color = RGBColor
    Call Invalidate(MapWindow.hWnd)

End Property

Public Property Let setPosX(ByVal x As Long)

    PosX = x
    Call Invalidate(MapWindow.hWnd)

End Property

Public Property Let setPosY(ByVal y As Long)

    PosY = y
    Call Invalidate(MapWindow.hWnd)

End Property

Public Property Let setGrhIndex(ByVal Index As Long)

    GrhIndex = Index
    Call Invalidate(MapWindow.hWnd)

End Property

Private Sub Invalidate(ByVal hWnd As Long)

    Call PostMessage(hWnd, &HF, ByVal 0, ByVal 0) ' Hack: Call OnPaint() by sending WM_PAINT

End Sub

Friend Sub Initialize(ByRef MapPic As PictureBox, _
                      ByVal tGrhIndex As Long, _
                      ByVal DestX As Long, _
                      ByVal DestY As Long, _
                      Optional ByVal RGBColor As Long = -1)

    On Error GoTo ErrHandler

    Set MapWindow = MapPic

    'Make sure auto-redraw is set to false
    MapWindow.AutoRedraw = False
    
    'Set apropiate scale (pixel)
    MapWindow.ScaleMode = 3
    
    GrhIndex = tGrhIndex
    PosX = DestX
    PosY = DestY
    Color = RGBColor
    
    If (Device = 0) Then
        Device = wGL_Graphic.Create_Device_From_Display(MapPic.hWnd, MapPic.ScaleWidth, MapPic.ScaleHeight)

    End If
    
    Call Invalidate(MapPic.hWnd)
    
    Exit Sub
  
ErrHandler:
    Call LogError("Error" & Err.Number & "(" & Err.Description & ") en Sub Initialize de clsGraphicalMap.cls")

End Sub

Private Sub MapWindow_MouseUp(Button As Integer, Shift As Integer, x As Single, y As Single)

    On Error GoTo ErrHandler
  
    If x < 0 Or y < 0 Or x > MapWindow.Width Or y > MapWindow.Height Then
        Exit Sub

    End If

    Call Invalidate(MapWindow.hWnd)
  
    Exit Sub
  
ErrHandler:
    Call LogError("Error" & Err.Number & "(" & Err.Description & ") en Sub MapWindow_MouseUp de clsGraphicalMap.cls")

End Sub

Public Sub MapWindow_Paint()

    On Error GoTo ErrHandler

    If GrhIndex > 0 Then
        Call wGL_Graphic.Use_Device(Device)
        Call wGL_Graphic.Clear(CLEAR_COLOR Or CLEAR_DEPTH Or CLEAR_STENCIL, &H0, 1#, 0)
        Call wGL_Graphic_Renderer.Update_Projection(&H0, MapWindow.ScaleWidth, MapWindow.ScaleHeight)
        Call SetEffect(False)

        Call DrawGrhToIndex(GrhIndex, PosX, PosY, -1, 0, Color)
 
        Call wGL_Graphic_Renderer.Flush
    Else
        MapWindow.Cls

    End If

    Exit Sub
  
ErrHandler:
    Call LogError("Error" & Err.Number & "(" & Err.Description & ") en Sub RenderMap de clsGraphicalMap.cls")

End Sub

