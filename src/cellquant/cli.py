# argparse e os comandos: start, stop, setup, build, test, backup, …
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from datetime import datetime
from pathlib import Path

from cellquant import __version__
from cellquant.project import (
    APP_URL,
    HOST,
    PORT,
    ensure_data_dir,
    ensure_spa,
    ensure_venv,
    health_json,
    install_backend,
    listening_pids,
    npm_cmd,
    port_open,
    repo_root,
    run_npm,
    stop_pids,
    wait_health,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="cellquant",
        description="CLI do CellQuant: SPA de contagem celular de LCR.",
    )
    parser.add_argument(
        "-V", "--version", action="version", version=f"cellquant {__version__}"
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    start = sub.add_parser("start", help="Sobe o app em http://127.0.0.1:8000")
    start.add_argument(
        "--no-browser", action="store_true", help="Não abre o navegador"
    )
    start.add_argument(
        "--reload",
        action="store_true",
        help="API com auto-reload (desenvolvimento)",
    )

    sub.add_parser("stop", help="Encerra o processo na porta 8000")
    sub.add_parser("status", help="Diz se o app está no ar")
    sub.add_parser("health", help="Consulta GET /health")
    sub.add_parser("open", help="Abre http://127.0.0.1:8000 no navegador")

    sub.add_parser("setup", help="Cria venv, instala Python e gera a SPA")
    sub.add_parser("build", help="Compila a SPA (precisa de Node)")

    test = sub.add_parser("test", help="Roda pytest e Vitest")
    test.add_argument(
        "--e2e", action="store_true", help="Também roda Playwright (e2e/)"
    )

    sub.add_parser("backup", help="Copia o SQLite para data/backups/")
    sub.add_parser(
        "dev",
        help="API com --reload e Vite na 5173 (dois processos)",
    )
    return parser


def cmd_setup(root: Path) -> int:
    install_backend(root)
    ensure_data_dir(root)
    ensure_spa(root, force_build=True)
    print("Setup concluído. Rode: cellquant start")
    return 0


def cmd_build(root: Path) -> int:
    if not npm_cmd():
        print("Node/npm não encontrado.")
        return 1
    ensure_spa(root, force_build=True)
    print("SPA em frontend/dist")
    return 0


def _uvicorn_cmd(root: Path, *, reload: bool) -> list[str]:
    py = ensure_venv(root)
    cmd = [
        str(py),
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        HOST,
        "--port",
        str(PORT),
    ]
    if reload:
        cmd.append("--reload")
    return cmd


def cmd_start(root: Path, *, no_browser: bool, reload: bool) -> int:
    if port_open():
        data = health_json()
        if data:
            print(f"CellQuant já está no ar: {APP_URL}")
            if not no_browser:
                webbrowser.open(APP_URL)
            return 0
        print(f"A porta {PORT} está ocupada por outro processo. Rode: cellquant stop")
        return 1

    install_backend(root)
    ensure_data_dir(root)
    ensure_spa(root)

    if not no_browser:
        threading.Thread(target=_open_when_ready, daemon=True).start()

    print(f"Abrindo {APP_URL}")
    return subprocess.run(
        _uvicorn_cmd(root, reload=reload),
        cwd=root / "backend",
        check=False,
    ).returncode


def _open_when_ready() -> None:
    if wait_health(25):
        webbrowser.open(APP_URL)


def cmd_stop() -> int:
    pids = listening_pids()
    if not pids:
        print("Nenhum CellQuant escutando na porta 8000.")
        return 0
    stop_pids(pids)
    print("CellQuant encerrado.")
    return 0


def cmd_status() -> int:
    data = health_json()
    if data:
        print(f"no ar  {APP_URL}  {data}")
        return 0
    if port_open():
        print(f"porta {PORT} ocupada, mas /health não respondeu")
        return 1
    print("parado")
    return 1


def cmd_health() -> int:
    data = health_json()
    if not data:
        print("API indisponível. Rode: cellquant start")
        return 1
    print(data)
    return 0


def cmd_open() -> int:
    webbrowser.open(APP_URL)
    print(APP_URL)
    return 0


def cmd_test(root: Path, *, e2e: bool) -> int:
    py = ensure_venv(root)
    extra = [str(root / "backend" / "requirements-dev.txt")]
    install_backend(root, extra=extra)
    print("pytest...")
    api = subprocess.run(
        [str(py), "-m", "pytest", "-q"],
        cwd=root / "backend",
        check=False,
    )
    code = api.returncode

    if npm_cmd():
        print("Vitest...")
        fe = run_npm(root, ["test"], check=False)
        code = code or fe
    else:
        print("Aviso: npm ausente — Vitest não rodou.")

    if e2e:
        if not npm_cmd():
            print("Aviso: npm ausente — e2e não rodou.")
            return code
        print("Playwright...")
        npm = npm_cmd()
        e2e_dir = root / "e2e"
        subprocess.run([npm, "ci"], cwd=e2e_dir, check=False)
        subprocess.run(
            [npm, "exec", "--", "playwright", "install", "chromium"],
            cwd=e2e_dir,
            check=False,
        )
        e2e_run = subprocess.run(
            [npm, "test"],
            cwd=e2e_dir,
            check=False,
        )
        code = code or e2e_run.returncode
    return code


def cmd_backup(root: Path) -> int:
    src = root / "data" / "contador_lcr.db"
    if not src.is_file():
        print("Nenhum banco ainda (data/contador_lcr.db). Rode o app ao menos uma vez.")
        return 1
    dest_dir = root / "data" / "backups"
    dest_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    dest = dest_dir / f"contador_lcr-{stamp}.db"
    shutil.copy2(src, dest)
    for suffix in ("-wal", "-shm"):
        extra = Path(str(src) + suffix)
        if extra.is_file():
            shutil.copy2(extra, dest_dir / f"{dest.name}{suffix}")
    print(f"Backup: {dest}")
    return 0


def cmd_dev(root: Path) -> int:
    if not npm_cmd():
        print("Node/npm é necessário para o Vite. Rode só: cellquant start --reload")
        return 1
    install_backend(root)
    ensure_data_dir(root)
    if not (root / "frontend" / "node_modules").is_dir():
        run_npm(root, ["ci"])

    print(f"API {APP_URL}  ·  SPA http://127.0.0.1:5173")
    print("Ctrl+C encerra os dois.")
    api = subprocess.Popen(
        _uvicorn_cmd(root, reload=True),
        cwd=root / "backend",
    )
    frontend = subprocess.Popen(
        [npm_cmd(), "run", "dev"],
        cwd=root / "frontend",
    )
    try:
        while True:
            api_code = api.poll()
            fe_code = frontend.poll()
            if api_code is not None:
                frontend.terminate()
                return api_code
            if fe_code is not None:
                api.terminate()
                return fe_code
            time.sleep(0.4)
    except KeyboardInterrupt:
        print("\nEncerrando...")
        return 0
    finally:
        for proc in (frontend, api):
            if proc.poll() is None:
                proc.terminate()
                try:
                    proc.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    proc.kill()


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.cmd in {"stop", "status", "health", "open"}:
        handlers = {
            "stop": cmd_stop,
            "status": cmd_status,
            "health": cmd_health,
            "open": cmd_open,
        }
        return handlers[args.cmd]()

    root = repo_root()
    if args.cmd == "start":
        return cmd_start(root, no_browser=args.no_browser, reload=args.reload)
    if args.cmd == "setup":
        return cmd_setup(root)
    if args.cmd == "build":
        return cmd_build(root)
    if args.cmd == "test":
        return cmd_test(root, e2e=args.e2e)
    if args.cmd == "backup":
        return cmd_backup(root)
    if args.cmd == "dev":
        return cmd_dev(root)
    parser.error(f"comando desconhecido: {args.cmd}")
    return 2


if __name__ == "__main__":
    sys.exit(main())
