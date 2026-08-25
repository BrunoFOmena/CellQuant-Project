# Testes do CLI (sem subir o servidor)
from pathlib import Path

import pytest

from cellquant.cli import build_parser, cmd_backup, main
from cellquant.project import _is_root, path_contains, pids_listening, repo_root


def test_parser_tem_comandos_padrao():
    parser = build_parser()
    for cmd in (
        "start",
        "stop",
        "status",
        "health",
        "open",
        "setup",
        "build",
        "test",
        "backup",
        "path",
        "dev",
    ):
        parser.parse_args([cmd])


def test_start_aceita_no_browser():
    args = build_parser().parse_args(["start", "--no-browser", "--reload"])
    assert args.no_browser is True
    assert args.reload is True


def test_help_sai_zero():
    with pytest.raises(SystemExit) as exc:
        main(["-h"])
    assert exc.value.code == 0


def test_pids_listening_netstat_windows():
    sample = """
  TCP    127.0.0.1:8000         0.0.0.0:0              LISTENING       4321
  TCP    127.0.0.1:5173         0.0.0.0:0              LISTENING       99
  TCP    127.0.0.1:8000         127.0.0.1:54321        ESTABLISHED     4321
"""
    assert pids_listening(8000, sample) == [4321]


def test_is_root_e_repo_root(tmp_path: Path):
    assert _is_root(tmp_path) is False
    (tmp_path / "backend" / "app").mkdir(parents=True)
    (tmp_path / "backend" / "app" / "main.py").write_text("# app\n", encoding="utf-8")
    (tmp_path / "frontend").mkdir()
    assert _is_root(tmp_path) is True
    assert _is_root(repo_root()) is True


def test_backup_copia_sqlite(tmp_path: Path):
    data = tmp_path / "data"
    data.mkdir()
    db = data / "contador_lcr.db"
    db.write_bytes(b"sqlite")
    assert cmd_backup(tmp_path) == 0
    backups = list((data / "backups").glob("contador_lcr-*.db"))
    assert len(backups) == 1
    assert backups[0].read_bytes() == b"sqlite"


def test_backup_sem_banco(tmp_path: Path):
    assert cmd_backup(tmp_path) == 1


def test_path_contains():
    assert path_contains(r"C:\a;C:\proj;C:\b", r"C:\proj") is True
    assert path_contains(r"C:\a;C:\proj\;C:\b", r"C:\proj") is True
    assert path_contains(r"C:\a;C:\outro", r"C:\proj") is False
