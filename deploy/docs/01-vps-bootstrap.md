# 01 — VPS bootstrap

One-time hardening of a fresh Ubuntu VPS, performed as `root`.

## Before you start

- A fresh Ubuntu 22.04 or 24.04 LTS VPS with `root` SSH access.
- Your **own** SSH public key already in `/root/.ssh/authorized_keys`.
- At least 2 vCPU and 2 GiB RAM (Next.js build will use ~1.5 GiB).
  The script adds 4 GiB of swap automatically if your RAM is below 4 GiB.

## Run the script

```bash
ssh root@YOUR_VPS_IP
curl -fsSL https://raw.githubusercontent.com/<you>/e-commerce-OSCAR/main/deploy/scripts/00-bootstrap.sh -o /tmp/bootstrap.sh
bash /tmp/bootstrap.sh
```

Or, after cloning the repo locally and scping it:

```bash
sudo bash /path/to/deploy/scripts/00-bootstrap.sh
```

## What it does

| Step | Effect |
|---|---|
| 1 | Creates the `oscar` Linux user, sets its password, grants passwordless sudo. |
| 2 | Copies `root`'s `authorized_keys` to `oscar` so you can SSH in as `oscar`. |
| 3 | Enables UFW with `OpenSSH`, `80`, `443` allowed (everything else denied). |
| 4 | Adds 4 GiB swap when total RAM is below 4 GiB. |

> SSH password authentication is **left enabled** so you can log in as `oscar`
> with the password. The default password is `majmajBS13..` — override with
> `OSCAR_PASSWORD='…' sudo bash 00-bootstrap.sh`.

All steps are idempotent — re-running won't break anything.

## After it finishes

Log out and log back in as `oscar`:

```bash
ssh oscar@YOUR_VPS_IP
```

Confirm you have sudo without password and that UFW is active:

```bash
sudo ufw status verbose
```

Then proceed to [02 — Dependencies](02-dependencies.md).

## Troubleshooting

- **Locked out after enabling UFW.** Always run UFW on a console-attached session,
  or pre-allow `OpenSSH` first (the script does this, but if you've customised
  port 22 → another port, allow that port first).
- **Want to disable SSH password auth later?** Set
  `PasswordAuthentication no` in `/etc/ssh/sshd_config` (or in a file under
  `/etc/ssh/sshd_config.d/`) and `sudo systemctl reload ssh`. Make sure you can
  log in with your SSH key first.
