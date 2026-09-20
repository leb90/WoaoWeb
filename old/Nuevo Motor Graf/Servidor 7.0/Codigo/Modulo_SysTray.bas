Attribute VB_Name = "SysTray"
Option Explicit
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿
'                       SysTray
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿
'Para minimizar a la barra de tareas
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿
'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿

Type CWPSTRUCT

    lParam As Long
    wParam As Long
    message As Long
    hwnd As Long

End Type

Declare Function CallNextHookEx _
                  Lib "user32" (ByVal hHook As Long, _
                                ByVal ncode As Long, _
                                ByVal wParam As Long, _
                                lParam As Any) As Long
Declare Sub CopyMemory _
             Lib "kernel32" _
                 Alias "RtlMoveMemory" (hpvDest As Any, _
                                        hpvSource As Any, _
                                        ByVal cbCopy As Long)
Declare Function SetForegroundWindow Lib "user32" (ByVal hwnd As Long) As Long
Declare Function SetWindowsHookEx _
                  Lib "user32" _
                      Alias "SetWindowsHookExA" (ByVal idHook As Long, _
                                                 ByVal lpfn As Long, _
                                                 ByVal hmod As Long, _
                                                 ByVal dwThreadId As Long) As Long
Declare Function UnhookWindowsHookEx Lib "user32" (ByVal hHook As Long) As Long

Public Const WH_CALLWNDPROC = 4
Public Const WM_CREATE = &H1

Public hHook As Long

Public Function AppHook(ByVal idHook As Long, _
                        ByVal wParam As Long, _
                        ByVal lParam As Long) As Long

    On Error GoTo fallo

    Dim CWP As CWPSTRUCT
    CopyMemory CWP, ByVal lParam, Len(CWP)

    Select Case CWP.message

    Case WM_CREATE
        SetForegroundWindow CWP.hwnd
        AppHook = CallNextHookEx(hHook, idHook, wParam, ByVal lParam)
        UnhookWindowsHookEx hHook
        hHook = 0
        Exit Function

    End Select

    AppHook = CallNextHookEx(hHook, idHook, wParam, ByVal lParam)

    Exit Function
fallo:
    Call LogError("apphook " & Err.number & " D: " & Err.Description)

End Function

